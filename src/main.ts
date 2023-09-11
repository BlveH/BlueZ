import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import { TransformationInterceptor } from "./responseInterceptor";
import cookieParser = require("cookie-parser");
import { ENV } from "./constants";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalInterceptors(new TransformationInterceptor());
  await app.listen(ENV.Port, () => {
    console.log(`Server is running on port: ${ENV.Port}`);
  });
}
bootstrap();
