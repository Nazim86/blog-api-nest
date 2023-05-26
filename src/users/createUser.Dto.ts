import { IsEmail, IsString, Length } from 'class-validator';
import { IsUserAlreadyExist } from '../decorators/IsUserAlreadyExist';

export class CreateUserDto {
  @IsString()
  @Length(3, 10)
  @IsUserAlreadyExist({ message: 'Existing Login' })
  login: string;

  @IsString()
  @Length(6, 20)
  password: string;

  @IsEmail()
  @IsUserAlreadyExist({ message: 'Existing email' })
  email: string;
}
