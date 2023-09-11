import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { SkuDetails } from "../model/product.model";
import { BaseType, CategoryType, PlatformType } from "src/auth/role/role.enum";

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  productName: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  image?: string;

  @IsOptional()
  imageDetails: Record<string, any>;

  @IsNotEmpty()
  @IsString()
  @IsEnum(CategoryType)
  category: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(PlatformType)
  platformType: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(BaseType)
  baseType: string;

  @IsNotEmpty()
  @IsString()
  productURL: string;

  @IsNotEmpty()
  @IsString()
  downloadURL: string;

  @IsNotEmpty()
  @IsArray()
  requirementSpecification: Record<string, any>[];

  @IsNotEmpty()
  @IsArray()
  highlights: string[];

  @IsArray()
  @IsOptional()
  skuDetails: SkuDetails[];

  @IsOptional()
  stripeProductId?: string;
}
