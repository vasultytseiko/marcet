import { Module } from '@nestjs/common';
import { IpService } from './ip.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Ip, IpSchema } from 'src/database/models/ip.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Ip.name, schema: IpSchema }])],
  providers: [IpService],
})
export class IpModule {}
