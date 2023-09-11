import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "src/auth/guard";
import { RolesGuard } from "src/auth/role/role.guard";
import { Roles } from "src/auth/role/role.decorator";
import { Role } from "src/auth/role/role.enum";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Get("")
  async findUserByRole(@Query("role") role: string) {
    return await this.adminService.findUserByRole(role);
  }
}
