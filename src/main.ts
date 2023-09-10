import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import config from "config";
import { TransformationInterceptor } from "./responseInterceptor";
import cookieParser = require("cookie-parser");

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalInterceptors(new TransformationInterceptor());
  await app.listen(config.get("port"), () => {
    console.log(`Server is running on port: ${config.get("port")}`);
  });
}
bootstrap();
