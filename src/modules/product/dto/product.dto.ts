import { OmitType, PartialType, PickType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ProductStatus } from 'src/shared/enums/product-status.enum';
import { ProductType } from 'src/shared/enums/product-type.enum';
import { Coupon } from 'src/shared/types/coupon.type';

class ProductDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  asin: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(ProductType)
  productType: ProductType;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  pageTitle: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  bullet_points: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  salePrice: number;

  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  percentageDiscount: number;

  @IsNotEmpty()
  @IsBoolean()
  @IsOptional()
  showDiscount: boolean;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  link: string;

  @IsNotEmpty()
  @IsObject()
  @IsOptional()
  pageColors: Record<any, string>;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  @IsEnum(ProductStatus)
  status: ProductStatus;

  @IsOptional()
  @IsNotEmpty()
  @IsObject()
  coupon: Coupon;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  image: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  file: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  fileText: string;

  @IsString()
  @IsOptional()
  video: string;

  @IsNotEmpty()
  @IsBoolean()
  @IsOptional()
  fileDownloadWithEmail: boolean;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  referralId: string;

  @IsNotEmpty()
  @IsString()
  image_url: string;

  @IsBoolean()
  unlimitedCoupons: boolean;
}

export class CreateProductDto extends PickType(ProductDto, [
  'asin',
  'productType',
  'link',
  'image',
  'title',
  'pageTitle',
  'salePrice',
  'percentageDiscount',
  'showDiscount',
  'pageColors',
  'file',
  'fileText',
  'video',
  'fileDownloadWithEmail',
  'coupon',
] as const) {}

export class UpdateProductDto extends PartialType(
  OmitType(ProductDto, ['asin'] as const),
) {}
