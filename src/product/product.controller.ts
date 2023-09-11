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
  UseInterceptors,
  UploadedFile,
  Put,
} from "@nestjs/common";
import { ProductService } from "./product.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { JwtAuthGuard } from "src/auth/guard";
import { Role } from "src/auth/role/role.enum";
import { Roles } from "src/auth/role/role.decorator";
import { RolesGuard } from "src/auth/role/role.guard";
import { GetProductDto } from "./dto/get-product.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { ENV } from "src/constants";
import { ProductSkuDto, ProductSkuDtoArray } from "./dto/product-sku.dto";

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

  @Post("update/:id/image")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @UseInterceptors(
    FileInterceptor("productImage", {
      dest: ENV.file_storage_path,
      limits: {
        fileSize: 3145728,
      },
    }),
  )
  async uploadProductImage(
    @Param("id") id: string,
    @UploadedFile() file: ParameterDecorator,
  ) {
    return await this.productService.uploadProductImage(id, file);
  }

  @Post("/update-sku/:productId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async updateProductSku(
    @Param("productId") productId: string,
    @Body() updateProductSkuDto: ProductSkuDtoArray,
  ) {
    return await this.productService.updateProductSku(
      productId,
      updateProductSkuDto,
    );
  }

  @Put("/update-sku/:productId/:skuId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async updateProductSkuById(
    @Param("productId") productId: string,
    @Param("skuId") skuId: string,
    @Body() updateProductSkuDto: ProductSkuDto,
  ) {
    return await this.productService.updateProductSkuById(
      productId,
      skuId,
      updateProductSkuDto,
    );
  }
}
