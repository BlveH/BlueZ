import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class ProductSkuDto {
  @IsNotEmpty()
  @IsString()
  skuName: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  validity: number;

  @IsNotEmpty()
  @IsBoolean()
  lifetime: boolean;

  @IsOptional()
  stripePriceId?: string;

  @IsOptional()
  skuCode?: string;
}

export class ProductSkuDtoArray {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  skuDetails: ProductSkuDto[];
}
