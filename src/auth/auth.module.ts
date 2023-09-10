import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "src/user/user.module";
import { RolesGuard } from "./role/role.guard";
import { PassportModule } from "@nestjs/passport";
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema, Users } from "src/user/model/user.model";
import { JwtStrategy } from "./guard";

@Module({
  imports: [
    JwtModule.register({}),
    UserModule,
    PassportModule,
    MongooseModule.forFeature([
      { name: Users.name, schema: UserSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard],
  exports: [RolesGuard, JwtModule],
})
export class AuthModule {}
