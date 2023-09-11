import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { BaseType, CategoryType, PlatformType } from "src/auth/role/role.enum";

@Schema({ timestamps: true })
export class FeedBackers extends Document {
  @Prop({})
  customerId: string;

  @Prop({})
  customerName: string;

  @Prop({})
  rating: number;

  @Prop({})
  feedbackMsg: string;
}

export const FeedBackSchema = SchemaFactory.createForClass(FeedBackers);

@Schema({ timestamps: true })
export class SkuDetails extends Document {
  @Prop({})
  skuName: string;

  @Prop({})
  price: number;

  @Prop({})
  validity: number; //in days

  @Prop({})
  lifetime: boolean;

  @Prop({})
  stripePriceId: string;

  @Prop({})
  skuCode?: string;
}

export const SkuDetailSchema = SchemaFactory.createForClass(SkuDetails);

@Schema({ timestamps: true })
export class Products extends Document {
  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    default:
      "https://www.google.com/url?sa=i&url=https%3A%2F%2Fstock.adobe.com%2Fsearch%2Fimages%3Fk%3Dno%2Bimage%2Bavailable&psig=AOvVaw1ubfVFe3_aiBKnepiwRzks&ust=1694523977139000&source=images&cd=vfe&opi=89978449&ved=0CBAQjRxqFwoTCMiz1-zPooEDFQAAAAAdAAAAABAE",
  })
  image?: string;

  @Prop({ required: true })
  category: CategoryType[];

  @Prop({ required: true })
  platformType: PlatformType[];

  @Prop({ required: true })
  baseType: BaseType[];

  @Prop({ required: true })
  productURL: string;

  @Prop({ required: true })
  downloadURL: string;

  @Prop({})
  avgRating: number;

  @Prop([{ type: FeedBackSchema }])
  feedbackDetails: FeedBackers[];

  @Prop([{ type: SkuDetailSchema }])
  skuDetails: SkuDetails[];

  @Prop({ type: Object })
  imageDetails: Record<string, any>;

  @Prop({})
  requirementSpecification: Record<string, any>[];

  @Prop({})
  highlights: string[];

  @Prop({})
  stripeProductId: string;
}

export const ProductSchema = SchemaFactory.createForClass(Products);
