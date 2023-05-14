import { IsString, Length, Matches } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @Length(0, 15)
  name: string;

  @IsString()
  @Length(0, 500)
  description: string;

  @IsString()
  @Length(0, 100)
  @Matches('^https://([a-zA-Z0-9_-]+.)+[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*/?$')
  websiteUrl: string;
}
