import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PageConfigurationService } from './page-configuration.service';
import { CreatePageConfigurationDto } from './dto/page-configuration.dto';
import { FindByIdDto } from 'src/shared/dto/findById.dto';
import { PageConfiguration } from 'src/shared/types/page-configuration.type';
import { User } from 'src/shared/decorators/user.decorator';
import { AuthGuard } from 'src/shared/guards/auth.guard';

@Controller('page-configurations')
export class PageConfigurationController {
  constructor(
    private readonly pageConfigurationService: PageConfigurationService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  @HttpCode(201)
  async create(
    @Body() createPageConfigurationDto: CreatePageConfigurationDto,
    @User() user: any,
  ) {
    const { sub } = user;

    const newPageConfiguration =
      await this.pageConfigurationService.createPageConfiguration(
        createPageConfigurationDto,
        sub,
      );

    return newPageConfiguration;
  }

  @Get()
  @HttpCode(200)
  async getAll(): Promise<PageConfiguration[]> {
    const fetchedPageConfigurations =
      await this.pageConfigurationService.getAllPageConfigurations();

    return fetchedPageConfigurations;
  }

  @Get(':id')
  @HttpCode(200)
  async get(
    @Param() pageConfigurationId: FindByIdDto,
  ): Promise<PageConfiguration> {
    const fetchedPageConfiguration =
      await this.pageConfigurationService.getPageConfiguration(
        pageConfigurationId,
      );

    if (!fetchedPageConfiguration) {
      throw new HttpException(
        'Page configuration not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return fetchedPageConfiguration;
  }
}
