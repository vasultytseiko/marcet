import { IsNotEmpty, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

export class UpdateByIdDto {
  @IsNotEmpty()
  @IsString()
  id: ObjectId;
}
