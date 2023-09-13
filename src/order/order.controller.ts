import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Headers,
  Query,
  UseGuards,
} from "@nestjs/common";
import { OrderService } from "./order.service";
import { CheckOutDtoArr } from "./dto/checkout.dto";
import { JwtAuthGuard } from "src/auth/guard";
import { Request } from "express";

@Controller("order")
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async findAll(@Query("status") status: string, @Req() req: any) {
    return await this.orderService.findAll(status, req.user);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return await this.orderService.findOne(id);
  }

  @Post("checkout")
  async checkout(@Body() body: CheckOutDtoArr, @Req() req: any) {
    return await this.orderService.checkout(body, req.user);
  }

  @Post("/webhook")
  async webhook(
    @Body() rawBody: Buffer,
    @Headers("stripe-signature") sig: string,
  ) {
    return await this.orderService.webhook(rawBody, sig);
  }
}
