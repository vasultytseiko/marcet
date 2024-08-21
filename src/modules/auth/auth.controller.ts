import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { LoginResponse, Seller } from 'src/shared/types/seller.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  @HttpCode(201)
  async signUp(@Body() signUpDto: SignUpDto): Promise<Seller> {
    const newUser = await this.authService.signUp(signUpDto);

    return newUser;
  }

  @Post('/signin')
  @HttpCode(200)
  async signIn(@Body() signInDto: SignInDto): Promise<LoginResponse> {
    const user = await this.authService.signIn(signInDto);

    return user;
  }
}
