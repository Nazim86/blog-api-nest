import { IsNotEmpty, IsString, Length, ValidateIf } from 'class-validator';
import { IsBlogAlreadyExist } from '../../../decorators/IsBlogIdExist';
import { Transform } from 'class-transformer';

export class CreatePostDto {
  @Length(0, 30)
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  title: string;

  @Length(0, 100)
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  shortDescription: string;

  @Length(0, 1000)
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  content: string;

  @IsBlogAlreadyExist()
  @IsNotEmpty()
  @IsString()
  @ValidateIf((object, value) => value !== undefined) // Only validate if blogId is defined
  blogId: string;
}
