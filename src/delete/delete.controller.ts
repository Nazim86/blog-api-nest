import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../api/public/blogs/domain/blog.entity';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../domains/post.entity';
import { Comment, CommentDocument } from '../domains/comment.entity';
import { User, UserDocument } from '../domains/user.entity';
import { PostLike, PostLikeDocument } from '../domains/postLike.entity';
import {
  CommentLike,
  CommentLikeDocument,
} from '../domains/commentLike.entity';

@Controller('testing/all-data')
export class DeleteController {
  constructor(
    @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
    @InjectModel(PostLike.name) private PostLikeModel: Model<PostLikeDocument>,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: Model<CommentLikeDocument>,
  ) {}

  @Delete()
  @HttpCode(204)
  async deleteRoutes() {
    await this.BlogModel.deleteMany({});
    await this.PostModel.deleteMany({});
    await this.CommentModel.deleteMany({});
    await this.UserModel.deleteMany({});
    await this.CommentLikeModel.deleteMany({});
    await this.PostLikeModel.deleteMany({});

    // await TokenModel.deleteMany({});
    // await IpModel.deleteMany({});
    // await LikeModel.deleteMany({});

    return;
  }
}
