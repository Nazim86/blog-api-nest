import { IsEmail, IsString, Matches } from 'class-validator';

export class EmailDto {
  @IsEmail()
  email: string;
}
