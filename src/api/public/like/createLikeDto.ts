import { LikeEnum } from './like.enum';
import { IsEnum } from 'class-validator';

export class CreateLikeDto {
  @IsEnum(LikeEnum)
  likeStatus: LikeEnum;
}
