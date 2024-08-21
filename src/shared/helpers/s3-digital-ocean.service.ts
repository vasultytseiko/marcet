import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class DigitalOceanService {
  private s3: AWS.S3;
  constructor() {
    this.s3 = new AWS.S3({
      endpoint: 'fra1.digitaloceanspaces.com',
      accessKeyId: process.env.STORAGE_ACCESS_KEY,
      secretAccessKey: process.env.STORAGE_SECRET_KEY,
    });
  }

  async uploadFile(
    buffer: Buffer,
    filename: string,
    contentType: string,
    isImage: boolean,
  ): Promise<string> {
    const params = {
      Bucket: '',
      Key: filename,
      Body: buffer,
      ContentEncoding: 'base64',
      ContentType: isImage ? contentType : null,
      ACL: 'public-read',
    };

    await this.s3.upload(params).promise();

    const fileLink = ``;

    return fileLink;
  }

  async deleteFile(filename: string): Promise<void> {
    const params = {
      Bucket: '',
      Key: filename,
    };

    await this.s3.deleteObject(params).promise();
  }
}
