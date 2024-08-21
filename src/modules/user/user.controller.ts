import {
  Body,
  Controller,
  Get,
  HttpCode,
  Ip,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DownloadFileDto, FollowLinkDto, TakeCouponDto } from './dto/user.dto';
import { UserService } from './user.service';
import { User } from 'src/shared/types/user.type';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { User as UserDecorator } from 'src/shared/decorators/user.decorator';
import { Product } from 'src/shared/types/product.type';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get()
  @HttpCode(200)
  async getUsers(
    @UserDecorator() seller: any,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<{ users: User[]; totalPages: number; currentPage: number }> {
    const { sub } = seller;

    const result = await this.userService.getAllUsers(sub, page, limit);

    return result;
  }

  @Post('follow-link')
  @HttpCode(200)
  async followByLink(@Body() productId: FollowLinkDto): Promise<Product> {
    const updatedProduct = await this.userService.followedByLink(productId);

    return updatedProduct;
  }

  @Post('download-file')
  @HttpCode(200)
  async downloadFile(
    @Body() downloadFileDto: DownloadFileDto,
  ): Promise<Product> {
    const updatedProduct =
      await this.userService.downloadFileByUser(downloadFileDto);

    return updatedProduct;
  }

  @Post(':id')
  @HttpCode(201)
  async takeCoupon(
    @Param('id') couponId: string,
    @Body() takeCouponDto: TakeCouponDto,
    @Ip() ip: string,
  ): Promise<{ code: string; quantity: number }> {
    const { code, quantity } = await this.userService.takeCouponByUser(
      couponId,
      takeCouponDto,
      ip,
    );

    return { code, quantity };
  }
}
