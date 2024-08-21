import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { DigitalOceanService } from 'src/shared/helpers/s3-digital-ocean.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService, DigitalOceanService],
})
export class UploadModule {}
