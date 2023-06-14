import { IsBoolean, IsNotEmpty, IsString, Length } from 'class-validator';

export class UserBanDto {
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean;

  @IsString()
  @IsNotEmpty()
  @Length(20)
  banReason: string;

  @IsString()
  @IsNotEmpty()
  blogId: string;
}
