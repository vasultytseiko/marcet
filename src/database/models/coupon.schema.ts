import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CouponDocument = HydratedDocument<Coupon>;

@Schema()
export class Coupon {
  @Prop()
  code: string;

  @Prop()
  type: string;

  @Prop()
  quantity: number;

  @Prop()
  created_at: Date;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
