import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { SellerService } from './seller.service';
import { Seller, SellerInfo } from 'src/shared/types/seller.type';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { User } from 'src/shared/decorators/user.decorator';
import { ObjectId } from 'mongoose';
import { ChangePasswordDto, UpdateSellerDto } from './dto/seller.dto';

@Controller('sellers')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @UseGuards(AuthGuard)
  @Get()
  @HttpCode(200)
  async get(@User() seller: any): Promise<SellerInfo> {
    const fetchedSeller = await this.sellerService.getSeller(
      seller.sub as ObjectId,
    );

    return fetchedSeller;
  }

  @UseGuards(AuthGuard)
  @Patch()
  @HttpCode(200)
  async update(
    @User() seller: any,
    @Body() updateSellerDto: UpdateSellerDto,
  ): Promise<Seller> {
    const updatedSeller = await this.sellerService.updateSeller(
      seller.sub,
      updateSellerDto,
    );

    return updatedSeller;
  }

  @UseGuards(AuthGuard)
  @Patch('change-password')
  @HttpCode(200)
  async changePassword(
    @User() seller: any,
    @Body() body: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const message = await this.sellerService.changePassword(
      seller.sub as ObjectId,
      body,
    );

    return message;
  }
}
