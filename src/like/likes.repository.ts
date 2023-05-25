import { InjectModel } from '@nestjs/mongoose';
import {
  PostLike,
  PostLikeDocument,
  PostLikeModelType,
} from './postLike.entity';
import {
  CommentLike,
  CommentLikeDocument,
  CommentLikeModelType,
} from './commentLike.entity';

export class LikesRepository {
  constructor(
    @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
  ) {}

  async findPostLike(
    postId: string,
    userId: string,
  ): Promise<PostLikeDocument | null> {
    return this.PostLikeModel.findOne({ postId, userId });
  }

  async findCommentLike(
    postId: string,
    userId: string,
  ): Promise<CommentLikeDocument | null> {
    return this.CommentLikeModel.findOne({ postId, userId });
  }

  async save(likeDocument: any) {
    return likeDocument.save();
  }
}
