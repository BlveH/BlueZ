import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import cookieParser = require("cookie-parser");
import { ENV } from "./constants";
import { ValidationPipe } from "@nestjs/common";
import { raw } from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.use(cookieParser());

  app.use("/api/v1/orders/webhook", raw({ type: "*/*" }));

  app.setGlobalPrefix(ENV.appPrefix);
  app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: false }));
  // app.useGlobalInterceptors(new TransformationInterceptor());
  await app.listen(ENV.Port, () => {
    console.log(`Server is running on port: ${ENV.Port}`);
  });
}
bootstrap();
