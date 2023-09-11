import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema, Users } from "./model/user.model";
import { AuthModule } from "src/auth/auth.module";

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: Users.name,
        schema: UserSchema,
      },
    ]),
  ],
})
export class UserModule {}
