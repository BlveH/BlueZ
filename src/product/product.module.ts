import { Module } from "@nestjs/common";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";
import { AuthModule } from "src/auth/auth.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ProductSchema, Products } from "./model/product.model";
import { UserSchema, Users } from "src/user/model/user.model";
import { ENV } from "src/constants";
import { StripeModule } from "nestjs-stripe";
import { ProductRepository } from "./repo/product.repo";
import { License, LicenseSchema } from "src/product/model/license.model";

@Module({
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
  imports: [
    AuthModule,
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
export class ProductModule {}
