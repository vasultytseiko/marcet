import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ProductStatus } from 'src/shared/enums/product-status.enum';
import { ProductType } from 'src/shared/enums/product-type.enum';
import { Coupon } from 'src/shared/types/coupon.type';
import { Question } from 'src/shared/types/question.type';
import { Review } from 'src/shared/types/review.type';

export type ProductDocument = HydratedDocument<Product>;

@Schema()
export class Product {
  @Prop()
  title: string;

  @Prop()
  pageTitle: string;

  @Prop()
  description: string;

  @Prop()
  bullet_points: string;

  @Prop()
  price: number;

  @Prop({ required: false })
  salePrice: number;

  @Prop({ required: false })
  percentageDiscount: number;

  @Prop({ required: false })
  showDiscount: boolean;

  @Prop()
  image_url: string;

  @Prop()
  images: string[];

  @Prop()
  rating: number;

  @Prop({ type: Object, required: false })
  coupon: Coupon;

  @Prop()
  status: ProductStatus;

  @Prop()
  asin: string;

  @Prop()
  productType: ProductType;

  @Prop()
  reviews: Review[];

  @Prop()
  questions: Question[];

  @Prop({ required: false })
  video: string;

  @Prop({ required: false })
  link: string;

  @Prop({ type: Object, required: false })
  pageColors: Record<any, string>;

  @Prop()
  image?: string;

  @Prop()
  file?: string;

  @Prop({ required: false })
  fileText: string;

  @Prop()
  fileDownloadWithEmail?: boolean;

  @Prop()
  pageViews: number;

  @Prop({ required: false })
  takenCoupons?: number;

  @Prop({ required: false })
  linkClicks?: number;

  @Prop({ required: false })
  filesDownloaded?: number;

  @Prop()
  conversationRate: mongoose.Types.Decimal128;

  @Prop()
  unlimitedCoupons: boolean;

  @Prop({ required: false })
  takenCouponByUser: boolean;

  @Prop()
  created_at: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
