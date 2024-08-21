import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Ip,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { Product } from 'src/shared/types/product.type';
import { ProductService } from './product.service';
import { FindByIdDto } from 'src/shared/dto/findById.dto';
import { UpdateByIdDto } from 'src/shared/dto/updateById.dto';
import { DeleteByIdDto } from 'src/shared/dto/deleteById.dto';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { ObjectId } from 'mongoose';
import { User } from 'src/shared/decorators/user.decorator';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(AuthGuard)
  @Post()
  @HttpCode(201)
  async create(
    @Body() createProductDto: CreateProductDto,
    @User() user: any,
  ): Promise<Product> {
    const { sub } = user;

    const newProduct = await this.productService.createProduct(
      createProductDto,
      sub as ObjectId,
    );

    return newProduct;
  }

  @UseGuards(AuthGuard)
  @Get('seller-products')
  @HttpCode(200)
  async getAll(
    @User() seller: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('title') title?: string,
  ): Promise<{ products: Product[]; totalPages: number; currentPage: number }> {
    const { sub } = seller;

    const result = await this.productService.getAllProducts(
      sub as ObjectId,
      page,
      limit,
      title,
    );

    return result;
  }

  @Get(':id')
  @HttpCode(200)
  async get(
    @Param() productId: FindByIdDto,
    @Ip() ip: string,
  ): Promise<Product> {
    const fetchedProduct = await this.productService.getProduct(productId, ip);

    return fetchedProduct;
  }

  @Delete(':id')
  @HttpCode(200)
  async delete(@Param() productId: DeleteByIdDto): Promise<Product> {
    const deletedProduct = await this.productService.deleteProduct(productId);

    return deletedProduct;
  }

  @Patch(':id')
  @HttpCode(200)
  async update(
    @Param() productId: UpdateByIdDto,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const updatedProduct = await this.productService.updateProduct(
      productId,
      updateProductDto,
    );

    return updatedProduct;
  }
}
