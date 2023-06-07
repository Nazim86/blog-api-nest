import { IsBoolean, IsNotEmpty, IsString, Length } from 'class-validator';

export class BanUserDto {
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean;

  @IsString()
  @IsNotEmpty()
  @Length(20)
  banReason: string;
}
