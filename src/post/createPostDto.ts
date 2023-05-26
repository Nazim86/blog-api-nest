import { IsNotEmpty, IsString, Length, ValidateIf } from 'class-validator';
import { IsBlogAlreadyExist } from '../decorators/IsBlogIdExist';

export class CreatePostDto {
  @Length(0, 30)
  @IsNotEmpty()
  @IsString()
  @ValidateIf((object, value) => value !== undefined) // Only validate if blogId is defined
  title: string;

  @IsString()
  @Length(0, 100)
  shortDescription: string;

  @IsString()
  @Length(0, 1000)
  content: string;

  @IsBlogAlreadyExist()
  @IsNotEmpty()
  @IsString()
  @ValidateIf((object, value) => value !== undefined) // Only validate if blogId is defined
  blogId: string;
}
