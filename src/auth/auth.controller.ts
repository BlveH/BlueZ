import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { JwtAuthGuard } from "./guard";
import { Request } from "express";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUser: { email: string; password: string }) {
    const loginResponse = await this.authService.login(
      loginUser.email,
      loginUser.password,
    );

    return loginResponse;
  }

  @Post("sign-up")
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get("verify-email/:otp/:email")
  async verifyEmail(@Param("otp") otp: string, @Param("email") email: string) {
    return await this.authService.verifyEmail(otp, email);
  }

  @Get("send-otp-email/:email")
  async sendOtpEmail(@Param("email") email: string) {
    return await this.authService.sendOtpEmail(email);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  logout(@Req() req: any, @Body("refreshToken") refreshToken: string) {
    console.log(refreshToken);
    return this.authService.logout(req.user, refreshToken);
  }

  @Get("forgot-password/:email")
  async forgotPassword(@Param("email") email: string) {
    return await this.authService.forgotPassword(email);
  }
}
