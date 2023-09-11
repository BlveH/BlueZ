import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { AuthModule } from "src/auth/auth.module";
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema, Users } from "src/user/model/user.model";

@Module({
  controllers: [AdminController],
  providers: [AdminService],
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
export class AdminModule {}
