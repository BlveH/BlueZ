import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MongooseModule } from "@nestjs/mongoose";
import config from "config";
import { AllExceptionFilter } from "../exceptionFilter";
import { UserModule } from "../user/user.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    MongooseModule.forRoot(config.get("mongoURI")),
    UserModule,
    AuthModule,
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
