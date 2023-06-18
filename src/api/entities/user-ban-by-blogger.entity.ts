import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { UserBanDto } from '../blogger/inputModel-Dto/userBan.dto';

export type BloggerBanUserDocument = HydratedDocument<BloggerBanUser>;

export type BloggerBanUserModelStaticType = {
  createBannedUser: (
    login: string,
    userId: string,
    userBanDto: UserBanDto,
    UserBanByBloggerModel: BloggerBanUserModelType,
  ) => BloggerBanUserDocument;
};

export type BloggerBanUserModelType = Model<BloggerBanUser> &
  BloggerBanUserModelStaticType;

@Schema()
export class BloggerBanUser {
  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  userId: string;

  @Prop({
    type: {
      isBanned: Boolean,
      banDate: String,
      banReason: String,
      blogId: String,
    },
    required: true,
  })
  banInfo: {
    isBanned: boolean;
    banDate: string;
    banReason: string;
    blogId: string;
  };

  static createBannedUser(
    login: string,
    userId: string,
    userBanDto: UserBanDto,
    UserBanByBloggerModel: BloggerBanUserModelType,
  ) {
    const bannedUser = {
      login: login,
      userId: userId,
      banInfo: {
        isBanned: userBanDto.isBanned,
        banDate: new Date().toISOString(),
        banReason: userBanDto.banReason,
        blogId: userBanDto.blogId,
        userId: userId,
      },
    };
    return new UserBanByBloggerModel(bannedUser);
  }

  updateBannedUser(login: string, userId: string, userBanDto: UserBanDto) {
    (this.login = login),
      (this.userId = userId),
      (this.banInfo.isBanned = userBanDto.isBanned),
      (this.banInfo.banDate = new Date().toISOString()),
      (this.banInfo.banReason = userBanDto.banReason),
      (this.banInfo.blogId = userBanDto.blogId);
  }
}
const userBanByBloggerStaticMethods: BloggerBanUserModelStaticType = {
  createBannedUser: BloggerBanUser.createBannedUser,
};
export const UserBanByBloggerSchema =
  SchemaFactory.createForClass(BloggerBanUser);

UserBanByBloggerSchema.statics = userBanByBloggerStaticMethods;

UserBanByBloggerSchema.methods = {
  updateBannedUser: BloggerBanUser.prototype.updateBannedUser,
};
