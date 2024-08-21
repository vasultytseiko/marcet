import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Coupon } from 'src/shared/types/coupon.type';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop({ type: Object })
  coupons: Coupon[];

  @Prop()
  campaignName: string;

  @Prop()
  ipAddress: string;

  @Prop()
  created_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
