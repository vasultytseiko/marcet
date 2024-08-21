import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ip as IpDB } from 'src/database/models/ip.schema';
import { Ip } from 'src/shared/types/ip.type';

@Injectable()
export class IpService {
  constructor(@InjectModel(IpDB.name) private readonly ipModel: Model<IpDB>) {}

  async createIp(ip: string): Promise<Ip> {
    const newIp = new this.ipModel({ ip: ip });

    const savedIp = await newIp.save();

    return savedIp;
  }

  async getIp(ip: string): Promise<Ip> {
    const fetchedIp = await this.ipModel.findOne({ ip });

    return fetchedIp;
  }

  async addViewedProduct(ip: string, productId: string): Promise<Ip> {
    const updatedIp = await this.ipModel.findOneAndUpdate(
      { ip },
      { $addToSet: { viewedProducts: productId } },
      { new: true },
    );

    return updatedIp;
  }
}
