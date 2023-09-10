import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Role } from "../../auth/role/role.enum";

@Schema({
  timestamps: true,
})
export class Users extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    required: true,
  })
  role: Role[];

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: null })
  otp: string;

  @Prop({ default: [] })
  refreshTokens: string[];

  @Prop({ default: null })
  otpExpiredTime: Date;
}

export const UserSchema = SchemaFactory.createForClass(Users);
