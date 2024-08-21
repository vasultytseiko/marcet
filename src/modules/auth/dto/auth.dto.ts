import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { OmitType, PickType } from '@nestjs/mapped-types';

class AuthDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/gi, {
    message:
      'Password must be at least eight characters long, include at least one letter, one number, and one special character',
  })
  @MinLength(8)
  @IsNotEmpty()
  @IsString()
  password: string;

  created_at: Date;
}

export class SignUpDto extends OmitType(AuthDto, [
  'created_at',
  'firstName',
  'lastName',
] as const) {}

export class SignInDto extends PickType(AuthDto, [
  'email',
  'password',
] as const) {}
