import { IsString, Length, ValidateIf } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @Length(0, 30)
  title: string;

  @IsString()
  @Length(0, 100)
  shortDescription: string;

  @IsString()
  @Length(0, 1000)
  content: string;

  @IsString()
  @ValidateIf((object, value) => value !== undefined) // Only validate if blogId is defined
  blogId?: string;
}
