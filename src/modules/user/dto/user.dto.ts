import { PickType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

class UserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  productId: ObjectId;
}

export class TakeCouponDto extends UserDto {}

export class FollowLinkDto extends PickType(UserDto, ['productId'] as const) {}

export class DownloadFileDto extends UserDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @IsString()
  @IsOptional()
  email: string;

  @IsNotEmpty()
  @IsString()
  productId: ObjectId;
}
