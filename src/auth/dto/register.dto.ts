import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { Role } from "../role/role.enum";

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  @IsIn([Role.Admin, Role.Customer])
  role: string;

  @IsOptional()
  @IsString()
  secretToken?: string;

  isVerified?: boolean;
}
