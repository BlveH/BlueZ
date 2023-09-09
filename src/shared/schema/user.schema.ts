import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export enum userRole {
  ADMIN = "admin",
  CUSTOMER = "customer",
}

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
    enum: [userRole.ADMIN, userRole.CUSTOMER],
  })
  role: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: null })
  otp: string;

  @Prop({ default: null })
  otpExpiredTime: Date;
}

export const UserSchema = SchemaFactory.createForClass(Users);
