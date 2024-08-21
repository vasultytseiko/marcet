import { Module } from '@nestjs/common';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Seller, SellerSchema } from 'src/database/models/seller.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Seller.name, schema: SellerSchema }]),
  ],
  controllers: [SellerController],
  providers: [SellerService],
})
export class SellerModule {}
