import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { UserRepository } from "src/shared/repositories/user.repo";
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema, Users } from "src/shared/schema/user.schema";
import { APP_GUARD } from "@nestjs/core";
import { RolesGuard } from "src/shared/middleware/role.guard";
import { AuthMiddleware } from "src/shared/middleware/auth.middleware";

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  imports: [
    MongooseModule.forFeature([
      {
        name: Users.name,
        schema: UserSchema,
      },
    ]),
  ],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: "/user", method: RequestMethod.GET });
  }
}
