import { Coupon } from './coupon.type';

export type User = {
  name: string;
  email: string;
  coupons: Coupon[];
  campaignName: string;
  ipAddress: string;
  created_at: Date;
};
