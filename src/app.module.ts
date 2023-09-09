import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MongooseModule } from "@nestjs/mongoose";
import config from "config";
import { AllExceptionFilter } from "./exceptionFilter";

@Module({
  imports: [MongooseModule.forRoot(config.get("mongoURI"))],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: "APP_FILTER",
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule {}
