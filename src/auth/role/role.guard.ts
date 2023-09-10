import { Injectable, CanActivate } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ExecutionContext } from "@nestjs/common";
import { ROLES_KEY } from "./role.decorator";
import { JwtService } from "@nestjs/jwt";
import config from "config";
import { Role } from "./role.enum";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const bearerToken = request.headers.authorization?.replace(
      "Bearer ",
      "",
    );
    if (!bearerToken) {
      return false;
    }

    const payload = this.jwtService.verify(bearerToken, {
      secret: config.get("secretToken"),
    });
    const user = payload.role as Role[];

    return requiredRoles.some((type) => user.includes(type));
  }
}
