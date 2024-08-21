import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
  IsNumber,
} from 'class-validator';

class SellerDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdateSellerDto extends SellerDto {
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  streetAddition?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  postalCode?: number;

  @IsOptional()
  @IsString()
  imprint: string;
}

export class ChangePasswordDto {
  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  confirmNewPassword: string;
}
