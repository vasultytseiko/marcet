import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SignUpDto, SignInDto } from './dto/auth.dto';
import { LoginResponse, Seller } from 'src/shared/types/seller.type';
import { InjectModel } from '@nestjs/mongoose';
import {
  Seller as SellerDB,
  SellerDocument,
} from 'src/database/models/seller.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(SellerDB.name)
    private readonly sellerModel: Model<SellerDB>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<Seller> {
    const { email, password } = signUpDto;

    await this.findRegisteredEmail(email);

    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = new this.sellerModel({ ...signUpDto });
    seller.password = hashedPassword;
    seller.created_at = new Date();

    const newSeller = await seller.save();

    const updatedSeller = await this.addJwtToken(newSeller);

    if (!newSeller) {
      throw new HttpException(
        'Failed to write user to DB',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return updatedSeller;
  }

  async findRegisteredEmail(email: string): Promise<void> {
    const fetchedUser = await this.sellerModel.findOne({ email });

    if (fetchedUser) {
      throw new HttpException(
        'This email is already registered',
        HttpStatus.CONFLICT,
      );
    }
  }

  async signIn(signInDto: SignInDto): Promise<LoginResponse> {
    const { email, password } = signInDto;

    const fetchedSeller = await this.sellerModel.findOne({
      email,
    });

    if (!fetchedSeller) {
      throw new HttpException(
        'Incorrect email or password',
        HttpStatus.NOT_FOUND,
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      fetchedSeller.password,
    );

    if (!isPasswordValid) {
      throw new HttpException(
        'Incorrect email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const updatedSeller = await this.addJwtToken(fetchedSeller);

    const {
      _id,
      firstName,
      lastName,
      email: sellerEmail,
      created_at,
    } = fetchedSeller;

    const { token } = updatedSeller;

    return {
      _id,
      firstName,
      lastName,
      email: sellerEmail,
      token,
      created_at,
    };
  }

  async addJwtToken(user: SellerDocument): Promise<Seller> {
    const { _id, email } = user;

    const payload = { sub: _id, email };

    const token = await this.jwtService.signAsync(payload);

    const updatedSeller = await this.sellerModel.findByIdAndUpdate(
      { _id },
      { $set: { token: token } },
      { new: true },
    );

    return updatedSeller;
  }
}
