import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/database/models/user.schema';
import { Coupon, CouponSchema } from 'src/database/models/coupon.schema';
import { Product, ProductSchema } from 'src/database/models/product.schema';
import { Seller, SellerSchema } from 'src/database/models/seller.schema';
import { Ip, IpSchema } from 'src/database/models/ip.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Coupon.name, schema: CouponSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Seller.name, schema: SellerSchema },
      { name: Ip.name, schema: IpSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
