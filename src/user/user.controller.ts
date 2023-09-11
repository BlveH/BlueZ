import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";

import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "src/auth/guard";
import { RolesGuard } from "src/auth/role/role.guard";
import { Roles } from "src/auth/role/role.decorator";
import { Role } from "src/auth/role/role.enum";

@Controller("user")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Customer)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch("update-name-password/:id")
  updateNameOrPassword(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateNameOrPassword(id, updateUserDto);
  }
}
