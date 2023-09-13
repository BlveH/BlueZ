import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { ENV } from "src/constants";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: ENV.jwtSecret,
    });
  }
  async validate(payload: any) {
    return {
      _id: payload._id,
      email: payload.email,
      role: payload.role,
    };
  }
}
