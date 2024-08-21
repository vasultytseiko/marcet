import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteByIdDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
