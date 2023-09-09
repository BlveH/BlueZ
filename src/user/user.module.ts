import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { UserRepository } from "src/shared/repositories/user.repo";
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema, Users } from "src/shared/schema/user.schema";

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository],
  imports: [
    MongooseModule.forFeature([
      {
        name: Users.name,
        schema: UserSchema,
      },
    ]),
  ],
})
export class UserModule {}
