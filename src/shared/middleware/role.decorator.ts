import { userRole } from "../schema/user.schema";
import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export const Roles = (...roles: userRole[]) =>
  SetMetadata(ROLES_KEY, roles);
