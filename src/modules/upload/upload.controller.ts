import {
  Controller,
  Delete,
  HttpCode,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 30 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ): Promise<string> {
    const fileLink = await this.uploadService.createFile(file);

    return fileLink;
  }

  @Post('image')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() image: Express.Multer.File,
  ): Promise<string> {
    const imageLink = await this.uploadService.createImage(image);

    return imageLink;
  }

  @Delete(':filename')
  @HttpCode(200)
  async deleteFile(@Param('filename') filename: string): Promise<void> {
    await this.uploadService.deleteFile(filename);
  }
}
