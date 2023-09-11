import { Injectable } from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Products } from "./model/product.model";
import { Model } from "mongoose";
import { InjectStripe } from "nestjs-stripe";
import Stripe from "stripe";

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Products.name) private readonly productModel: Model<Products>,
    @InjectStripe() private readonly stripeClient: Stripe,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<{
    success: boolean;
    message: string;
    result: Products;
  }> {
    try {
      //create product in stripe
      if (!createProductDto.stripeProductId) {
        const createProductInStripe = await this.stripeClient.products.create({
          name: createProductDto.productName,
          description: createProductDto.description,
        });
        createProductDto.stripeProductId = createProductInStripe.id;
      }

      const createProductInDB =
        await this.productModel.create(createProductDto);

      return {
        success: true,
        message: "Product created successfully!",
        result: createProductInDB,
      };
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return `This action returns all product`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
