import { IsNotEmpty, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

export class FindByIdDto {
  @IsNotEmpty()
  @IsString()
  id: ObjectId;
}
