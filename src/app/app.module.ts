import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MongooseModule } from "@nestjs/mongoose";
import { AllExceptionFilter } from "../exceptionFilter";
import { UserModule } from "../user/user.module";
import { AuthModule } from "../auth/auth.module";
import { ENV } from "src/constants";
import { AdminModule } from "src/admin/admin.module";
import { ProductModule } from "src/product/product.module";

@Module({
  imports: [
    MongooseModule.forRoot(ENV.MongoURI),
    UserModule,
    AuthModule,
    AdminModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: "APP_FILTER",
      useClass: AllExceptionFilter,
    },
  ],
  exports: [AppService],
})
export class AppModule {}
