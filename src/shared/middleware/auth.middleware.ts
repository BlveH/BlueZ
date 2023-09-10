import {
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { UserRepository } from "../repositories/user.repo";
import { NextFunction, Request, Response } from "express";
import { decodeAuthToken } from "../utils/tokenGenerate.util";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(UserRepository) private readonly userDB: UserRepository,
  ) {}
  async use(req: Request | any, res: Response, next: NextFunction) {
    try {
      const authorizationHeader = req.headers.authorization;

      if (
        !authorizationHeader ||
        !authorizationHeader.startsWith("Bearer ")
      ) {
        throw new UnauthorizedException(
          "Missing or invalid Bearer Token",
        );
      }

      const token = authorizationHeader.split("Bearer ")[1];

      if (!token) {
        throw new UnauthorizedException("Missing Bearer Token");
      }

      const decodeData: any = decodeAuthToken(token);
      const user = await this.userDB.findById(decodeData.id);

      if (!user) {
        throw new UnauthorizedException("Unauthorized");
      }

      user.password = undefined;
      req.user = user;
      next();
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
