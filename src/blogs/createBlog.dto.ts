import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBlogDto {
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @Length(0, 15)
  name: string;

  @IsNotEmpty()
  @Length(0, 500)
  description: string;

  @IsString()
  @Length(0, 100)
  @Matches('^https://([a-zA-Z0-9_-]+.)+[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*/?$')
  websiteUrl: string;
}
