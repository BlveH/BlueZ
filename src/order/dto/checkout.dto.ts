import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from "class-validator";

export class CheckOutDto {
  @IsString()
  @IsNotEmpty()
  skuPriceId: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  skuId: string;
}

export class CheckOutDtoArr {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  checkOutDetails: CheckOutDto[];
}
