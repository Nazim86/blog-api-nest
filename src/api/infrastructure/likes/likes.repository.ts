import { InjectModel } from '@nestjs/mongoose';
import {
  PostLike,
  PostLikeDocument,
  PostLikeModelType,
} from '../../entities/postLike.entity';
import {
  CommentLike,
  CommentLikeDocument,
  CommentLikeModelType,
} from '../../entities/commentLike.entity';

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
    commentId: string,
    userId: string,
  ): Promise<CommentLikeDocument | null> {
    return this.CommentLikeModel.findOne({ commentId, userId });
  }

  async setBanStatusForCommentLike(userId: string, banStatus: boolean) {
    return this.CommentLikeModel.updateMany(
      { userId },
      { $set: { banStatus: banStatus } },
    );
  }

  async setBanStatusForPostLike(userId: string, banStatus: boolean) {
    return this.PostLikeModel.updateMany(
      { userId },
      { $set: { banStatus: banStatus } },
    );
  }

  async save(likeDocument: any) {
    return likeDocument.save();
  }
}
