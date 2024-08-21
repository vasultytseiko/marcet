import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PageConfigurationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  image: string;

  @IsString()
  @IsNotEmpty()
  file: string;

  @IsBoolean()
  @IsNotEmpty()
  allowDownloadByEmail: boolean;

  @IsString()
  @IsNotEmpty()
  productType: string;
}

export class CreatePageConfigurationDto extends PageConfigurationDto {}
