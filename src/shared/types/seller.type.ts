import { Types } from 'mongoose';
import { Product } from './product.type';
import { User } from './user.type';

export type Seller = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  products: Product[];
  users: User[];
  token: string;
  country?: string;
  companyName?: string;
  street?: string;
  streetAddition?: string;
  city?: string;
  postalCode?: number;
  imprint?: string;
  created_at: Date;
};

export type SellerInfo = {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  companyName: string;
  street: string;
  streetAddition: string;
  city: string;
  postalCode: number;
  imprint: string;
  created_at: Date;
};

export type LoginResponse = {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  token: string;
  created_at: Date;
};
