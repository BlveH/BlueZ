import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import { TransformationInterceptor } from "./responseInterceptor";
import cookieParser = require("cookie-parser");
import { ENV } from "./constants";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.setGlobalPrefix(ENV.appPrefix);
  app.useGlobalInterceptors(new TransformationInterceptor());
  app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: false }));
  await app.listen(ENV.Port, () => {
    console.log(`Server is running on port: ${ENV.Port}`);
  });
}
bootstrap();
