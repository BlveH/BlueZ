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
  Query,
  Headers,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Response } from "express";
import { Roles } from "src/shared/middleware/role.decorator";
import { userRole } from "src/shared/schema/user.schema";

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
    @Headers("authorization") authorizationHeader: string,
  ) {
    let token: string | undefined;

    if (authorizationHeader) {
      const [, tokenValue] = authorizationHeader.split("Bearer ");
      token = tokenValue;
    }

    const loginResponse = await this.userService.login(
      loginUser.email,
      loginUser.password,
    );

    return loginResponse;
  }

  @Get("verify-email/:otp/:email")
  async verifyEmail(
    @Param("otp") otp: string,
    @Param("email") email: string,
  ) {
    return await this.userService.verifyEmail(otp, email);
  }

  @Get("send-otp-email/:email")
  async sendOtpEmail(@Param("email") email: string) {
    return await this.userService.sendOtpEmail(email);
  }

  @Post("logout")
  async logout(@Res() res: Response) {
    res.clearCookie("_digi_auth_token");
    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Logout successful",
    });
  }

  @Get("forgot-password/:email")
  async forgotPassword(@Param("email") email: string) {
    return await this.userService.forgotPassword(email);
  }

  @Patch("update-name-password/:id")
  updateNameOrPassword(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateNameOrPassword(id, updateUserDto);
  }

  @Get()
  @Roles(userRole.ADMIN)
  async findAll(@Query("role") role: string) {
    return await this.userService.findAll(role);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.userService.remove(+id);
  }
}
