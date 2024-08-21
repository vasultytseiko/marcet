import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PageConfigurationDocument = HydratedDocument<PageConfiguration>;

@Schema()
export class PageConfiguration {
  @Prop()
  title: string;

  @Prop()
  image: string;

  @Prop()
  file: string;

  @Prop()
  allowDownloadByEmail: boolean;

  @Prop()
  productType: string;

  @Prop()
  created_at: Date;
}

export const PageConfigurationSchema =
  SchemaFactory.createForClass(PageConfiguration);
