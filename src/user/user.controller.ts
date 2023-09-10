import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { UserService } from "./user.service";

import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch("update-name-password/:id")
  updateNameOrPassword(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateNameOrPassword(id, updateUserDto);
  }

  @Get()
  async findAll(@Query("role") role: string) {
    return await this.userService.findAll(role);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.userService.remove(+id);
  }
}
