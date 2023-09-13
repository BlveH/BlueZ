import { Module } from "@nestjs/common";
import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";
import { AuthModule } from "src/auth/auth.module";
import { MongooseModule } from "@nestjs/mongoose";
import { OrderSchema, Orders } from "./model/order.model";
import { ProductSchema, Products } from "src/product/model/product.model";
import { UserSchema, Users } from "src/user/model/user.model";
import { StripeModule } from "nestjs-stripe";
import { ENV } from "src/constants";
import { License, LicenseSchema } from "src/product/model/license.model";
import { ProductRepository } from "src/product/repo/product.repo";

@Module({
  controllers: [OrderController],
  providers: [OrderService, ProductRepository],
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: Orders.name,
        schema: OrderSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: Products.name,
        schema: ProductSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: Users.name,
        schema: UserSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: License.name,
        schema: LicenseSchema,
      },
    ]),
    StripeModule.forRoot({
      apiKey: ENV.stripe_secret_key,
      apiVersion: "2023-08-16",
    }),
  ],
})
export class OrderModule {}
