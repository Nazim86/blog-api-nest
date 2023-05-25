import { LikeEnum } from './like.enum';
import { IsEnum } from 'class-validator';

export class UpdateLikeDto {
  @IsEnum(LikeEnum)
  likeStatus: LikeEnum;
}
