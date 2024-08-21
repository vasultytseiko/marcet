import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import {
  Product as ProductDB,
  ProductDocument,
} from 'src/database/models/product.schema';
import { Seller as SellerDB } from 'src/database/models/seller.schema';
import { Product } from 'src/shared/types/product.type';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ScraperService } from 'src/shared/helpers/scraper.service';
import { FindByIdDto } from 'src/shared/dto/findById.dto';
import { UpdateByIdDto } from 'src/shared/dto/updateById.dto';
import { DeleteByIdDto } from 'src/shared/dto/deleteById.dto';
import { Seller } from 'src/shared/types/seller.type';
import { Coupon as CouponDB } from 'src/database/models/coupon.schema';
import { Coupon } from 'src/shared/types/coupon.type';
import { ProductType } from 'src/shared/enums/product-type.enum';
import { ProductStatus } from 'src/shared/enums/product-status.enum';
import { IpService } from '../ip/ip.service';
import { Ip as IpDB } from 'src/database/models/ip.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(ProductDB.name)
    private readonly productModel: Model<ProductDB>,
    @InjectModel(SellerDB.name)
    private readonly sellerModel: Model<SellerDB>,
    @InjectModel(CouponDB.name)
    private readonly couponModel: Model<CouponDB>,
    @InjectModel(IpDB.name) private readonly ipModel: Model<IpDB>,
    private readonly scraperService: ScraperService,
    private readonly ipService: IpService,
  ) {}

  async createProduct(
    createProductDto: CreateProductDto,
    sellerId: ObjectId,
  ): Promise<Product> {
    const {
      asin,
      productType,
      title,
      pageTitle,
      percentageDiscount,
      showDiscount,
      image,
      file,
      fileText,
      fileDownloadWithEmail,
      video,
      link,
      pageColors,
      coupon,
    } = createProductDto;

    let productInfo: Product;
    if (asin) {
      productInfo = await this.scraperService.scrapeAndSave(asin, link);
    }

    const newCoupon = await this.createCouponForProduct(coupon);

    let product: ProductDocument;
    if (productType === ProductType.PRODUCT) {
      product = new this.productModel({
        ...productInfo,
        asin,
        pageTitle,
        productType,
        salePrice: productInfo?.price,
        percentageDiscount,
        showDiscount,
        link,
        video,
        pageColors,
        pageViews: 0,
        linkClicks: 0,
        conversationRate: 0,
        status: 'Not Published',
        created_at: new Date(),
      });
    } else if (productType === ProductType.PRODUCT_WITH_COUPON) {
      product = new this.productModel({
        ...productInfo,
        coupon: newCoupon ? newCoupon : {},
        asin,
        pageTitle,
        productType,
        salePrice: productInfo?.price,
        percentageDiscount,
        showDiscount,
        link,
        video,
        pageColors,
        pageViews: 0,
        takenCoupons: 0,
        conversationRate: 0,
        status: 'Not Published',
        unlimitedCoupons: true,
        takenCouponByUser: false,
        created_at: new Date(),
      });
    } else if (
      productType === ProductType.PRODUCT_WITH_CONTRACT ||
      productType === ProductType.PRODUCT_WITH_FILE
    ) {
      product = new this.productModel({
        title,
        productType,
        image,
        file,
        fileText,
        fileDownloadWithEmail,
        pageColors,
        pageViews: 0,
        filesDownloaded: 0,
        conversationRate: 0,
        status: 'Not Published',
        created_at: new Date(),
      });
    }

    const newProduct = await product.save();

    await this.saveProductToSeller(sellerId, product);

    if (!newProduct) {
      throw new HttpException(
        'Failed to write product to DB',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return newProduct;
  }

  async createCouponForProduct(coupon: Coupon): Promise<Coupon> {
    if (!coupon) {
      return null;
    }

    const { code, quantity } = coupon;

    const newCoupon = new this.couponModel({
      code,
      type: quantity ? 'Individual' : 'Universal',
      quantity,
      created_at: new Date(),
    });

    const savedCoupon = await newCoupon.save();

    return savedCoupon;
  }

  async findSellerById(sellerId: ObjectId): Promise<Seller> {
    const fetchedSeller = await this.sellerModel.findOne({ _id: sellerId });

    if (!fetchedSeller) {
      throw new HttpException('Seller not found', HttpStatus.NOT_FOUND);
    }

    return fetchedSeller;
  }

  async saveProductToSeller(
    sellerId: ObjectId,
    product: ProductDocument,
  ): Promise<Seller> {
    const fetchedSeller = await this.findSellerById(sellerId);

    if (!fetchedSeller) {
      throw new HttpException('Seller not found', HttpStatus.NOT_FOUND);
    }

    await this.sellerModel.findByIdAndUpdate(sellerId, {
      $push: {
        products: {
          $each: [product],
          $position: 0,
        },
      },
    });

    return fetchedSeller;
  }

  async getAllProducts(
    sellerId: ObjectId,
    page: number,
    limit: number,
    title?: string,
  ): Promise<{ products: Product[]; totalPages: number; currentPage: number }> {
    const fetchedSeller = await this.sellerModel.findById(sellerId);

    if (!fetchedSeller) {
      return {
        products: [],
        totalPages: 0,
        currentPage: page,
      };
    }

    let products = fetchedSeller.products;

    if (title) {
      const titleRegex = new RegExp(title, 'i');
      products = products.filter((product) => titleRegex.test(product.title));
    }

    const count = products.length;
    const totalPages = Math.ceil(count / limit);
    const paginatedProducts = products.slice((page - 1) * limit, page * limit);

    return {
      products: paginatedProducts,
      totalPages,
      currentPage: page,
    };
  }

  async getProduct(productId: FindByIdDto, ip: string): Promise<Product> {
    const { id } = productId;

    const fetchedProduct = await this.productModel.findById(id);
    if (!fetchedProduct) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    const fetchedIp = await this.ipService.getIp(ip);
    if (!fetchedIp) {
      await this.ipService.createIp(ip);
    }

    if (
      fetchedProduct.productType === ProductType.PRODUCT_WITH_COUPON &&
      fetchedProduct.status === ProductStatus.PUBLISHED
    ) {
      const { _id }: any = fetchedProduct?.coupon;

      const couponId = _id.toString();

      const fetchedIp = await this.ipModel.findOne({
        ip,
        takenCoupons: couponId,
      });

      const couponTakenByUser = !!fetchedIp;

      await this.productModel.findByIdAndUpdate(
        fetchedProduct._id,
        { $set: { takenCouponByUser: couponTakenByUser } },
        { new: true },
      );
    }

    let updatedProductWithPageViews: Product;
    if (
      fetchedProduct.status === ProductStatus.PUBLISHED &&
      (!fetchedIp || !fetchedIp.viewedProducts.includes(id.toString()))
    ) {
      updatedProductWithPageViews = await this.productModel.findOneAndUpdate(
        { _id: fetchedProduct._id },
        {
          $inc: { pageViews: 1 },
        },
        { new: true },
      );

      await this.ipService.addViewedProduct(ip, fetchedProduct._id.toString());

      await this.sellerModel.updateOne(
        { products: { $elemMatch: { _id: id } } },
        { $set: { 'products.$.pageViews': fetchedProduct.pageViews + 1 } },
        { new: true },
      );
    }

    let updatedProduct: Product;
    if (fetchedProduct.status == ProductStatus.PUBLISHED) {
      let percent: string | undefined;

      if (updatedProductWithPageViews) {
        const pageViews = updatedProductWithPageViews.pageViews || 1;
        let numerator: number;

        if (fetchedProduct.productType === ProductType.PRODUCT) {
          numerator = updatedProductWithPageViews.linkClicks || 0;
        } else if (
          fetchedProduct.productType === ProductType.PRODUCT_WITH_COUPON
        ) {
          numerator = updatedProductWithPageViews.takenCoupons || 0;
        } else if (
          fetchedProduct.productType === ProductType.PRODUCT_WITH_FILE ||
          fetchedProduct.productType === ProductType.PRODUCT_WITH_CONTRACT
        ) {
          numerator = updatedProductWithPageViews.filesDownloaded || 0;
        }
        percent = ((numerator / pageViews) * 100).toFixed(2) + '%';
      }

      updatedProduct = await this.productModel.findOneAndUpdate(
        { _id: fetchedProduct._id },
        {
          $set: {
            conversationRate: percent,
          },
        },
        { new: true },
      );

      await this.sellerModel.updateOne(
        { 'products._id': fetchedProduct._id },
        {
          $set: {
            'products.$.conversationRate': updatedProduct.conversationRate,
          },
        },
        { new: true },
      );
    }

    return await this.productModel.findById(id);
  }

  async deleteProduct(productId: DeleteByIdDto): Promise<Product> {
    const { id } = productId;

    await this.deleteProductFromSeller(id);

    const deletedProduct = await this.productModel.findByIdAndDelete(id);

    if (!deletedProduct) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    return deletedProduct;
  }

  async deleteProductFromSeller(productId: string): Promise<void> {
    const productObjectId = Types.ObjectId.createFromHexString(productId);

    const fetchedSeller = await this.sellerModel.findOneAndUpdate(
      { products: { $elemMatch: { _id: productObjectId } } },
      { $pull: { products: { _id: productObjectId } } },
    );

    if (!fetchedSeller) {
      throw new HttpException('Seller not found', HttpStatus.NOT_FOUND);
    }
  }

  async updateProduct(
    productId: UpdateByIdDto,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const { id } = productId;
    const { referralId, link, coupon } = updateProductDto;

    let formattedLink: string;

    if (referralId || link) {
      formattedLink = await this.addReferralLink(id, referralId);
    }

    let newCoupon: Coupon;
    if (coupon) {
      newCoupon = await this.createCouponForProduct(coupon);
    }

    const updatedProductDto = {
      ...updateProductDto,
      link: link ? link : formattedLink,
      coupon: newCoupon,
    };

    const updatedProduct = await this.productModel.findByIdAndUpdate(
      id,
      updatedProductDto,
      { new: true },
    );

    if (!updatedProduct) {
      throw new HttpException(
        'Failed to update product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const seller = await this.sellerModel.findOneAndUpdate(
      { products: { $elemMatch: { _id: id } } },
      { $set: { 'products.$': updatedProduct } },
      { new: true },
    );

    if (!seller) {
      throw new HttpException(
        'Failed to update seller',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return updatedProduct;
  }

  async addReferralLink(id: ObjectId, referralId: string): Promise<string> {
    const fetchedProduct = await this.productModel.findById(id);

    let formattedLink: string;
    if (referralId) {
      formattedLink = `https://www.amazon.com/dp/${referralId}/${fetchedProduct.asin}`;
    } else {
      formattedLink = `https://www.amazon.com/dp/${fetchedProduct.asin}`;
    }

    return formattedLink;
  }
}
