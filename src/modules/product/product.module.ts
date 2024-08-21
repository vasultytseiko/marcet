import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/database/models/product.schema';
import { ScraperService } from 'src/shared/helpers/scraper.service';
import { Seller, SellerSchema } from 'src/database/models/seller.schema';
import { Coupon, CouponSchema } from 'src/database/models/coupon.schema';
import { User, UserSchema } from 'src/database/models/user.schema';
import { IpService } from '../ip/ip.service';
import { Ip, IpSchema } from 'src/database/models/ip.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      {
        name: Seller.name,
        schema: SellerSchema,
      },
      {
        name: Coupon.name,
        schema: CouponSchema,
      },
      { name: User.name, schema: UserSchema },
      { name: Ip.name, schema: IpSchema },
    ]),
  ],
  providers: [ScraperService, ProductService, IpService],
  controllers: [ProductController],
})
export class ProductModule {}
