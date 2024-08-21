import { Module } from '@nestjs/common';
import { PageConfigurationService } from './page-configuration.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PageConfiguration,
  PageConfigurationSchema,
} from 'src/database/models/page-configuration.schema';
import { PageConfigurationController } from './page-configuration.controller';
import { Seller, SellerSchema } from 'src/database/models/seller.schema';
import { SellerService } from '../seller/seller.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PageConfiguration.name, schema: PageConfigurationSchema },
      { name: Seller.name, schema: SellerSchema },
    ]),
  ],
  controllers: [PageConfigurationController],
  providers: [PageConfigurationService, SellerService],
})
export class PageConfigurationModule {}
