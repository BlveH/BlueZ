import { Role } from "./auth/role/role.enum";
declare module "express" {
  export interface Request {
    user: ReqUser;
  }
}
export declare interface ReqUser {
  email: string;
  roles: Role[];
}
