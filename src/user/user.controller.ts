import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Res,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Response } from "express";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("sign-up")
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginUser: { email: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const loginResponse = await this.userService.login(
      loginUser.email,
      loginUser.password,
    );
    if (loginResponse.success) {
      response.cookie(
        "_digi_auth_token",
        loginResponse.result?.token,
        {
          httpOnly: true,
        },
      );
    }

    delete loginResponse.result?.token;
    return loginResponse;
  }

  @Get("verify-email/:otp/:email")
  async verifyEmail(
    @Param("otp") otp: string,
    @Param("email") email: string,
  ) {
    return await this.userService.verifyEmail(otp, email);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.userService.remove(+id);
  }
}
