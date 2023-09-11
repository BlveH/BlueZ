import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { ProductService } from "./product.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { JwtAuthGuard } from "src/auth/guard";
import { Role } from "src/auth/role/role.enum";
import { Roles } from "src/auth/role/role.decorator";
import { RolesGuard } from "src/auth/role/role.guard";
import { GetProductDto } from "./dto/get-product.dto";

@Controller("product")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post("create")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return await this.productService.createProduct(createProductDto);
  }

  @Get(":id")
  async findOneProduct(@Param("id") id: string) {
    return await this.productService.findOneProduct(id);
  }

  @Get()
  async findAllProduct(@Query() query: GetProductDto) {
    return await this.productService.findAllProduct(query);
  }

  @Patch("update/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async updateProduct(
    @Param("id") id: string,
    @Body() updateProductDto: CreateProductDto,
  ) {
    return await this.productService.updateProduct(id, updateProductDto);
  }

  @Delete("delete/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async removeProductById(@Param("id") id: string) {
    return await this.productService.removeProductById(id);
  }
}
