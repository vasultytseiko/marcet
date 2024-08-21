import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import {
  PageConfiguration as PageConfigurationDB,
  PageConfigurationDocument,
} from 'src/database/models/page-configuration.schema';
import { CreatePageConfigurationDto } from './dto/page-configuration.dto';
import { PageConfiguration } from 'src/shared/types/page-configuration.type';
import { FindByIdDto } from 'src/shared/dto/findById.dto';
import { SellerService } from '../seller/seller.service';
import { Seller } from 'src/database/models/seller.schema';

@Injectable()
export class PageConfigurationService {
  constructor(
    @InjectModel(PageConfigurationDB.name)
    private readonly pageConfigurationModel: Model<PageConfigurationDB>,
    @InjectModel(Seller.name) private readonly sellerModel: Model<Seller>,
    private readonly sellerService: SellerService,
  ) {}

  async createPageConfiguration(
    createPageConfigurationDto: CreatePageConfigurationDto,
    sellerId: ObjectId,
  ): Promise<PageConfiguration> {
    const pageConfiguration = new this.pageConfigurationModel(
      createPageConfigurationDto,
    );
    pageConfiguration.created_at = new Date();

    const savedPageConfiguration = await pageConfiguration.save();

    await this.addPageConfigurationToSeller(sellerId, pageConfiguration);

    return savedPageConfiguration;
  }

  async addPageConfigurationToSeller(
    sellerId: ObjectId,
    pageConfiguration: PageConfigurationDocument,
  ) {
    const [fetchedSeller, fetchedPageConfiguration] = await Promise.all([
      this.sellerService.getSeller(sellerId),
      this.pageConfigurationModel.findOne({ _id: pageConfiguration._id }),
    ]);

    if (!fetchedPageConfiguration) {
      throw new HttpException(
        'Page configuration not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const {
      _id,
      title,
      image,
      file,
      allowDownloadByEmail,
      productType,
      created_at,
    } = fetchedPageConfiguration;

    const addedProduct = {
      _id,
      title,
      image,
      file,
      allowDownloadByEmail,
      productType,
      created_at,
    };

    await this.sellerModel.findByIdAndUpdate(sellerId, {
      $push: { products: addedProduct },
    });

    return fetchedSeller;
  }

  async getAllPageConfigurations(): Promise<PageConfiguration[]> {
    const fetchedPageConfigurations = await this.pageConfigurationModel.find(
      {},
    );

    return fetchedPageConfigurations;
  }

  async getPageConfiguration(
    pageConfigurationId: FindByIdDto,
  ): Promise<PageConfiguration> {
    const { id } = pageConfigurationId;

    const fetchedPageConfiguration =
      await this.pageConfigurationModel.findById(id);

    if (!fetchedPageConfiguration) {
      throw new HttpException(
        'Page configuration not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return fetchedPageConfiguration;
  }
}
