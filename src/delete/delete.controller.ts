import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Blog,
  BlogDocument,
} from '../api/entities/mongoose-schemas/blog.entity';
import { Model } from 'mongoose';
import {
  Post,
  PostDocument,
} from '../api/entities/mongoose-schemas/post.entity';
import {
  Comment,
  CommentDocument,
} from '../api/entities/mongoose-schemas/comment.entity';
import {
  User,
  UserDocument,
} from '../api/entities/mongoose-schemas/user.entity';
import {
  PostLike,
  PostLikeDocument,
} from '../api/entities/mongoose-schemas/postLike.entity';
import {
  CommentLike,
  CommentLikeDocument,
} from '../api/entities/mongoose-schemas/commentLike.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

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
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Delete()
  @HttpCode(204)
  async deleteRoutes() {
    await this.dataSource.query(`Delete from public.users`);
    // await this.dataSource.query(`Delete from public.devices`);
    // await this.dataSource.query(`Delete from public.post_like`);
    // await this.dataSource.query(`Delete from public.blog_owner_info`);
    // await this.dataSource.query(`Delete from public.blogs`);
    // await this.dataSource.query(`Delete from public.comment_like`);
    await this.dataSource.query(`Delete from public.email_confirmation`);
    await this.dataSource.query(`Delete from public.password_recovery`);
    await this.dataSource.query(`Delete from public.users_ban_by_sa`);
    // await this.dataSource.query(`Delete from public.blog_ban_info`);
    // await this.dataSource.query(`Delete from public.posts`);
    // await this.dataSource.query(`Delete from public.comments`);
    // await this.dataSource.query(`Delete from public.post_info`);
    // await this.dataSource.query(`Delete from public.commentator_info`);
    // await this.dataSource.query(`Delete from public.post_like`);
    // await this.dataSource.query(`Delete from public.users_ban_by_blogger`);

    return;
  }
}
