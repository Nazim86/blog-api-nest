import { IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBlogDto {
  //@Transform(({ value }) => value.trim())
  @Length(0, 15)
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @Length(0, 500)
  description: string;

  @IsString()
  @Length(0, 100)
  @IsUrl()
  websiteUrl: string;
}
