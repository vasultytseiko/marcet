import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type IpDocument = HydratedDocument<Ip>;

@Schema()
export class Ip {
  @Prop()
  ip: string;

  @Prop()
  viewedProducts: string[];

  @Prop()
  takenCoupons: string[];
}

export const IpSchema = SchemaFactory.createForClass(Ip);
