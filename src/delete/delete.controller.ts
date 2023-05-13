import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../blogs/domain/blog.entity';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../post/domain/post.entity';
import { Comment, CommentDocument } from '../comments/comment.entity';
import { User, UserDocument } from '../users/domain/user.entity';

@Controller('testing/all-data')
export class DeleteController {
  constructor(
    @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
  ) {}

  @Delete()
  @HttpCode(204)
  async deleteRoutes() {
    await this.BlogModel.deleteMany({});
    await this.PostModel.deleteMany({});
    await this.CommentModel.deleteMany({});
    await this.UserModel.deleteMany({});
    // await TokenModel.deleteMany({});
    // await IpModel.deleteMany({});
    // await LikeModel.deleteMany({});

    return;
  }
}
