import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ProductModule } from './modules/product/product.module';
import { SellerModule } from './modules/seller/seller.module';
import { UploadModule } from './modules/upload/upload.module';
import { UserModule } from './modules/user/user.module';
import { IpModule } from './modules/ip/ip.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.DB_URL),
    AuthModule,
    ProductModule,
    SellerModule,
    UploadModule,
    UserModule,
    IpModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
