import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Product } from 'src/shared/types/product.type';
import { User } from 'src/shared/types/user.type';

export type SellerDocument = HydratedDocument<Seller>;

@Schema()
export class Seller {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  products: Product[];

  @Prop()
  users: User[];

  @Prop()
  token: string;

  @Prop()
  country: string;

  @Prop()
  companyName: string;

  @Prop()
  street?: string;

  @Prop()
  streetAddition?: string;

  @Prop()
  city?: string;

  @Prop()
  postalCode?: number;

  @Prop()
  imprint: string;

  @Prop()
  created_at: Date;
}

export const SellerSchema = SchemaFactory.createForClass(Seller);
