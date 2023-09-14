import { Injectable, CanActivate } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ExecutionContext } from "@nestjs/common";
import { ROLES_KEY } from "./role.decorator";
import { JwtService } from "@nestjs/jwt";
import { ENV } from "src/constants";
import { Role } from "./role.enum";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (!requiredRoles) {
        return true;
      }

      const request = context.switchToHttp().getRequest();
      const bearerToken = request.headers.authorization?.replace("Bearer ", "");
      if (!bearerToken) {
        return false;
      }

      const payload = this.jwtService.verify(bearerToken, {
        secret: ENV.jwtSecret,
      });

      const userRoles = payload.role as Role[];

      return requiredRoles.some((role) => userRoles.includes(role));
    } catch (error) {
      throw error;
    }
  }
}
