import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DigitalOceanService } from 'src/shared/helpers/s3-digital-ocean.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  constructor(private readonly digitalOceanService: DigitalOceanService) {}
  async createFile(file: Express.Multer.File): Promise<string> {
    const fileBuffer = file.buffer;
    const contentType = file.mimetype;

    const fileName = `${uuidv4()}-${file.originalname}`
      .trim()
      .replace(/\s/g, '');

    const fileLink = await this.digitalOceanService.uploadFile(
      fileBuffer,
      fileName,
      contentType,
      false,
    );

    return fileLink;
  }

  async createImage(image: Express.Multer.File): Promise<string> {
    const imageBuffer = image.buffer;
    const contentType = image.mimetype;

    if (!/^image\//.test(contentType)) {
      throw new HttpException(
        'Invalid file type. Only images are allowed.',
        HttpStatus.CONFLICT,
      );
    }

    const imageName = `${uuidv4()}-${image.originalname}`
      .trim()
      .replace(/\s/g, '');

    const imageLink = await this.digitalOceanService.uploadFile(
      imageBuffer,
      imageName,
      contentType,
      true,
    );

    return imageLink;
  }

  async deleteFile(filename: string): Promise<void> {
    await this.digitalOceanService.deleteFile(filename);
  }
}
