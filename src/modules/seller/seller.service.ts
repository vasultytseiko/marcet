import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Seller as SellerDB } from 'src/database/models/seller.schema';
import { Seller, SellerInfo } from 'src/shared/types/seller.type';
import { ChangePasswordDto, UpdateSellerDto } from './dto/seller.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SellerService {
  constructor(
    @InjectModel(SellerDB.name) private readonly sellerModel: Model<SellerDB>,
  ) {}

  async getSeller(sellerId: ObjectId): Promise<SellerInfo> {
    const fetchedSeller = await this.sellerModel.findById(sellerId);

    if (!fetchedSeller) {
      throw new HttpException('Seller not found', HttpStatus.NOT_FOUND);
    }

    const {
      _id,
      firstName,
      lastName,
      email,
      country,
      companyName,
      street,
      streetAddition,
      city,
      postalCode,
      imprint,
      created_at,
    } = fetchedSeller;

    return {
      _id,
      firstName,
      lastName,
      email,
      country,
      companyName,
      street,
      streetAddition,
      city,
      postalCode,
      imprint,
      created_at,
    };
  }

  async updateSeller(
    sellerId: string,
    updateSellerDto: UpdateSellerDto,
  ): Promise<Seller> {
    const { password, ...updateData } = updateSellerDto;

    if (updateData.email) {
      await this.checkExistingEmail(updateData.email);
    }

    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedSeller = await this.sellerModel.findByIdAndUpdate(
      {
        _id: sellerId,
      },
      password !== null
        ? { ...updateData, password: hashedPassword }
        : updateData,
      { new: true },
    );

    if (!updatedSeller) {
      throw new HttpException('Seller not found', HttpStatus.NOT_FOUND);
    }

    return updatedSeller;
  }

  async checkExistingEmail(email: string): Promise<void> {
    const existingUser = await this.sellerModel.findOne({ email });

    if (existingUser) {
      throw new HttpException(
        'Email is already in use',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async changePassword(
    sellerId: ObjectId,
    body: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { oldPassword, newPassword, confirmNewPassword } = body;

    const fetchedSeller = await this.sellerModel.findById(sellerId);

    const isMatch = await bcrypt.compare(oldPassword, fetchedSeller.password);

    if (!isMatch) {
      throw new HttpException(
        'Old password is incorrect',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (newPassword !== confirmNewPassword) {
      throw new HttpException(
        'New password and confirmation password do not match',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.sellerModel.updateOne(
      { _id: sellerId },
      { $set: { password: hashedPassword } },
    );

    return { message: 'Password changed successfully' };
  }
}
