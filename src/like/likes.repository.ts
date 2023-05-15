import { InjectModel } from '@nestjs/mongoose';
import {
  PostLike,
  PostLikeDocument,
  PostLikeModelType,
} from './postLike.entity';

export class LikesRepository {
  constructor(
    @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
  ) {}

  async findPostLike(
    postId: string,
    userId: string,
  ): Promise<PostLikeDocument> {
    return this.PostLikeModel.findOne({ postId, userId });
  }

  async save(postLike: PostLikeDocument) {
    return postLike.save();
  }
}
