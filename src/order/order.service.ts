import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { CheckOutDtoArr } from "./dto/checkout.dto";
import { ProductRepository } from "src/product/repo/product.repo";
import { InjectStripe } from "nestjs-stripe";
import Stripe from "stripe";
import { ENV } from "src/constants";
import { Users } from "src/user/model/user.model";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { OrderStatus, PaymentStatus, Role } from "src/auth/role/role.enum";
import { Orders } from "./model/order.model";
import { Products } from "src/product/model/product.model";
import { sendEmail } from "src/utils/mailHandle";

@Injectable()
export class OrderService {
  constructor(
    @Inject(ProductRepository) private readonly productRepo: ProductRepository,
    @InjectModel(Users.name) private readonly userModel: Model<Users>,
    @InjectModel(Products.name) private readonly productModel: Model<Products>,
    @InjectModel(Orders.name) private readonly orderModel: Model<Orders>,
    @InjectStripe() private readonly stripeClient: Stripe,
  ) {}

  async create(createOrderDto: Record<string, any>) {
    try {
      const orderExists = await this.orderModel.findOne({
        checkoutSessionId: createOrderDto.checkoutSessionId,
      });
      if (orderExists) return orderExists;
      const result = await this.orderModel.create(createOrderDto);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async findAll(status: string, user: Record<string, any>) {
    try {
      const userDetails = await this.userModel.findOne({
        _id: user._id,
      });
      const query = {} as Record<string, any>;
      if (userDetails.role.toString() === Role.Customer) {
        query.userId = user._id;
      }
      if (status) {
        query.status = status;
      }
      console.log(query);
      const orders = await this.orderModel.find({ orderId: query.userId });
      console.log(orders);
      return {
        success: true,
        result: orders,
        message: "Orders fetched successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const result = await this.orderModel.findOne({ _id: id });
      return {
        success: true,
        result,
        message: "Order fetched successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  async checkout(body: CheckOutDtoArr, user: Record<string, any>) {
    try {
      const lineItems = [];
      const cartItems = body.checkOutDetails;
      for (const item of cartItems) {
        const itemsAreInStock = await this.productRepo.findLicense({
          productSku: item.skuId,
          isSold: false,
        });

        if (itemsAreInStock.length <= item.quantity) {
          lineItems.push({
            price: item.skuPriceId,
            quantity: item.quantity,
            adjustable_quantity: {
              enabled: true,
              maximum: 5,
              minimum: 1,
            },
          });
        }
      }
      console.log(lineItems);

      if (lineItems.length === 0) {
        throw new BadRequestException(
          "These products are not available right now",
        );
      }

      const session = await this.stripeClient.checkout.sessions.create({
        line_items: lineItems,
        metadata: {
          userId: user._id,
        },
        mode: "payment",
        billing_address_collection: "required",
        phone_number_collection: {
          enabled: true,
        },
        customer_email: user.email,
        success_url: ENV.stripe_success_url,
        cancel_url: ENV.stripe_cancel_url,
      });

      return {
        success: true,
        message: "Payment checkout session successfully created",
        result: session.url,
      };
    } catch (error) {
      throw error;
    }
  }

  async webhook(rawBody: Buffer, sig: string) {
    try {
      let event;
      try {
        event = this.stripeClient.webhooks.constructEvent(
          rawBody,
          sig,
          ENV.webhook_secret,
        );
      } catch (err) {
        throw new BadRequestException("Webhook Error:", err.message);
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderData = await this.createOrderObject(session);
        const order = await this.create(orderData);
        if (session.payment_status === PaymentStatus.Paid) {
          if (
            order.orderStatus[(OrderStatus.Completed, OrderStatus.Pending)] !==
            OrderStatus.Completed
          ) {
            for (const item of order.orderedItems) {
              const licenses = await this.getLicense(orderData.orderId, item);
              item.licenses = licenses;
            }
          }
          await this.fullfillOrder(session.id, {
            orderStatus: OrderStatus.Completed,
            isOrderDelivered: true,
            ...orderData,
          });
          this.sendOrderEmail(
            orderData.customerEmail,
            orderData.orderId,
            `${ENV.orderSuccess}${order._id}`,
          );
        }
      } else {
        console.log("Unhandled event type", event.type);
      }
    } catch (error) {
      throw error;
    }
  }

  async fullfillOrder(
    checkoutSessionId: string,
    updateOrderDto: Record<string, any>,
  ) {
    try {
      return await this.orderModel.findOneAndUpdate(
        { checkoutSessionId },
        updateOrderDto,
        { new: true },
      );
    } catch (error) {
      throw error;
    }
  }

  async sendOrderEmail(email: string, orderId: string, orderLink: string) {
    await sendEmail(email, ENV.orderSuccess, "Order Success - Bluezone", {
      orderId,
      orderLink,
    });
  }

  async getLicense(orderId: string, item: Record<string, any>) {
    try {
      const product = await this.productModel.findOne({
        _id: item.productId,
      });

      const skuDetails = product.skuDetails.find(
        (sku) => sku.skuCode === item.skuCode,
      );

      const licenses = await this.productRepo.findLicense(
        {
          productSku: skuDetails._id,
          isSold: false,
        },
        item.quantity,
      );

      const licenseIds = licenses.map((license) => license._id);

      await this.productRepo.updateLicenseMany(
        {
          _id: {
            $in: licenseIds,
          },
        },
        {
          isSold: true,
          orderId,
        },
      );

      return licenses.map((license) => license.licenseKey);
    } catch (error) {
      throw error;
    }
  }

  async createOrderObject(session: Stripe.Checkout.Session) {
    try {
      const lineItems = await this.stripeClient.checkout.sessions.listLineItems(
        session.id,
      );
      const orderData = {
        orderId: Math.floor(new Date().valueOf() * Math.random()) + "",
        userId: session.metadata?.userId?.toString(),
        customerAddress: session.customer_details?.address,
        customerEmail: session.customer_email,
        customerPhoneNumber: session.customer_details?.phone,
        paymentInfo: {
          paymentMethod: session.payment_method_types[0],
          paymentIntentId: session.payment_intent,
          paymentDate: new Date(),
          paymentAmount: session.amount_total / 100,
          paymentStatus: session.payment_status,
        },
        orderDate: new Date(),
        checkoutSessionId: session.id,
        orderedItems: lineItems.data.map((item) => {
          item.price.metadata.quantity = item.quantity + "";
          return item.price.metadata;
        }),
      };
      return orderData;
    } catch (error) {
      throw error;
    }
  }
}
