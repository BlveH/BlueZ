import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from "../user/user.module";
import { AuthModule } from "../auth/auth.module";
import { ENV } from "src/constants";
import { AdminModule } from "src/admin/admin.module";
import { ProductModule } from "src/product/product.module";
import { OrderModule } from "src/order/order.module";

@Module({
  imports: [
    MongooseModule.forRoot(ENV.MongoURI),
    UserModule,
    AuthModule,
    AdminModule,
    ProductModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
