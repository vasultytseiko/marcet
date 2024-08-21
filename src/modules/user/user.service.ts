import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DownloadFileDto, FollowLinkDto, TakeCouponDto } from './dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User as UserDB } from 'src/database/models/user.schema';
import {
  Coupon as CouponDB,
  CouponDocument,
} from 'src/database/models/coupon.schema';
import { Model, ObjectId } from 'mongoose';
import { Coupon } from 'src/shared/types/coupon.type';
import { Product as ProductDB } from 'src/database/models/product.schema';
import { Seller as SellerDB } from 'src/database/models/seller.schema';
import { Product } from 'src/shared/types/product.type';
import { User } from 'src/shared/types/user.type';
import { Ip as IpDB } from 'src/database/models/ip.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserDB.name) private readonly userModel: Model<UserDB>,
    @InjectModel(CouponDB.name) private readonly couponModel: Model<CouponDB>,
    @InjectModel(ProductDB.name)
    private readonly productModel: Model<ProductDB>,
    @InjectModel(SellerDB.name) private readonly sellerModel: Model<SellerDB>,
    @InjectModel(IpDB.name) private readonly ipModel: Model<IpDB>,
  ) {}

  async getAllUsers(
    sellerId: string,
    page: number,
    limit: number,
  ): Promise<{ users: User[]; totalPages: number; currentPage: number }> {
    const fetchedSeller = await this.sellerModel.findById(sellerId);

    if (!fetchedSeller) {
      return {
        users: [],
        totalPages: 0,
        currentPage: page,
      };
    }

    const users = fetchedSeller?.users.slice((page - 1) * limit, page * limit);

    const count = fetchedSeller?.users.length;

    return {
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
  }

  async takeCouponByUser(
    couponId: string,
    takeCouponDto: TakeCouponDto,
    ip: string,
  ): Promise<{ code: string; quantity: number }> {
    const fetchedCoupon = await this.findCouponById(couponId);

    await this.takeCouponOnceByUser(fetchedCoupon as CouponDocument, ip);

    await this.updateTakenCouponsCounter(fetchedCoupon as CouponDocument);

    let quantity: number | null = fetchedCoupon.quantity;

    if (fetchedCoupon.type === 'Individual') {
      if (fetchedCoupon.quantity === null || fetchedCoupon.quantity > 0) {
        if (fetchedCoupon.quantity !== null) {
          quantity = await this.decrementIndividualCoupon(
            fetchedCoupon as CouponDocument,
          );
        }
      } else {
        throw new HttpException(
          'Coupon quantity is insufficient',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const fetchedProduct = await this.findProductByCouponId(
      fetchedCoupon as CouponDocument,
    );

    const newUser = new this.userModel(takeCouponDto);
    newUser.coupons = [];
    newUser.coupons.push(fetchedCoupon);
    newUser.campaignName = fetchedProduct.title;
    newUser.created_at = new Date();
    newUser.ipAddress = ip;

    await newUser.save();

    const { code } = fetchedCoupon;

    const { _id } = fetchedCoupon as CouponDocument;

    await this.sellerModel.findOneAndUpdate(
      {
        'products.coupon._id': _id,
      },
      {
        $push: { users: newUser },
      },
    );

    await this.ipModel.findOneAndUpdate(
      { ip },
      { $addToSet: { takenCoupons: couponId } },
      { new: true },
    );

    return { code, quantity };
  }

  async takeCouponOnceByUser(
    coupon: CouponDocument,
    ip: string,
  ): Promise<void> {
    const user = await this.userModel.findOne({
      'coupons._id': coupon._id,
      ipAddress: ip,
    });

    if (user) {
      throw new HttpException(
        'User has already taken this coupon',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findCouponById(couponId: string): Promise<Coupon> {
    const fetchedCoupon = await this.couponModel.findById(couponId);

    if (!fetchedCoupon) {
      throw new HttpException('Coupon not found', HttpStatus.NOT_FOUND);
    }

    return fetchedCoupon;
  }

  async findProductByCouponId(coupon: CouponDocument): Promise<Product> {
    const fetchedProduct = await this.productModel.findOne({
      'coupon._id': coupon._id,
    });

    return fetchedProduct;
  }

  async decrementIndividualCoupon(
    coupon: CouponDocument,
  ): Promise<number | null> {
    if (coupon.quantity === null) {
      return null;
    }

    const updatedCoupon = await this.couponModel.findByIdAndUpdate(
      coupon._id,
      {
        $inc: { quantity: -1 },
      },
      { new: true },
    );

    if (!updatedCoupon) {
      throw new HttpException(
        'Failed to decrement coupon quantity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.updateProductCouponQuantity(coupon, updatedCoupon.quantity);

    await this.updateSellerProductCouponQuantity(
      coupon,
      updatedCoupon.quantity,
    );

    return updatedCoupon.quantity;
  }

  async updateTakenCouponsCounter(coupon: CouponDocument): Promise<void> {
    const updatedProduct = await this.productModel.findOneAndUpdate(
      { 'coupon._id': coupon._id },
      { $inc: { takenCoupons: 1 } },
      { new: true },
    );

    await this.updateSellerProductTakenCouponsQuantity(
      coupon,
      updatedProduct.takenCoupons,
    );
  }

  async updateSellerProductTakenCouponsQuantity(
    coupon: CouponDocument,
    takenCouponsQuantity: number,
  ): Promise<void> {
    await this.sellerModel.findOneAndUpdate(
      { 'products.coupon._id': coupon._id },
      {
        $set: {
          'products.$.takenCoupons': takenCouponsQuantity,
        },
      },
      { new: true },
    );
  }

  private async updateProductCouponQuantity(
    coupon: CouponDocument,
    quantity: number,
  ): Promise<void> {
    await this.productModel.updateMany(
      { 'coupon._id': coupon._id },
      { $set: { 'coupon.quantity': quantity } },
    );
  }

  private async updateSellerProductCouponQuantity(
    coupon: CouponDocument,
    quantity: number,
  ): Promise<void> {
    await this.sellerModel.updateMany(
      { 'products.coupon._id': coupon._id },
      { $set: { 'products.$.coupon.quantity': quantity } },
    );
  }

  async followedByLink(followLinkDto: FollowLinkDto): Promise<Product> {
    const { productId } = followLinkDto;

    const updatedProduct = await this.productModel.findByIdAndUpdate(
      {
        _id: productId,
      },
      {
        $inc: { linkClicks: 1 },
      },
      { new: true },
    );

    if (!updatedProduct) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    await this.updateSellerFollowLinkCounter(
      productId,
      updatedProduct.linkClicks,
    );

    return updatedProduct;
  }

  async updateSellerFollowLinkCounter(
    productId: ObjectId,
    clicksLinkQuantity: number,
  ): Promise<void> {
    await this.sellerModel.findOneAndUpdate(
      { products: { $elemMatch: { _id: productId } } },
      { $set: { 'products.$.linkClicks': clicksLinkQuantity } },
      { new: true },
    );
  }

  async downloadFileByUser(downloadFileDto: DownloadFileDto): Promise<Product> {
    const { productId } = downloadFileDto;

    const updatedProduct = await this.productModel.findByIdAndUpdate(
      {
        _id: productId,
      },
      {
        $inc: { filesDownloaded: 1 },
      },
      { new: true },
    );

    if (!updatedProduct) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    await this.updateSellerDownloadedFiles(
      productId,
      updatedProduct.filesDownloaded,
    );

    return updatedProduct;
  }

  async updateSellerDownloadedFiles(
    productId: ObjectId,
    filesDownloadedQuantity: number,
  ): Promise<void> {
    await this.sellerModel.findOneAndUpdate(
      {
        products: { $elemMatch: { _id: productId } },
      },
      { $set: { 'products.$.filesDownloaded': filesDownloadedQuantity } },
      { new: true },
    );
  }
}
