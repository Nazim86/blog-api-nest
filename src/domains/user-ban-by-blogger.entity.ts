import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { UserBanDto } from '../api/blogger/inputModel-Dto/userBan.dto';

export type UserBanByBloggerDocument = HydratedDocument<UserBanByBlogger>;

export type UserBanByBloggerModelStaticType = {
  createBannedUser: (
    login: string,
    userId: string,
    userBanDto: UserBanDto,
    UserBanByBloggerModel: UserBanByBloggerModelType,
  ) => UserBanByBloggerDocument;
};

export type UserBanByBloggerModelType = Model<UserBanByBlogger> &
  UserBanByBloggerModelStaticType;

@Schema()
export class UserBanByBlogger {
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
    UserBanByBloggerModel: UserBanByBloggerModelType,
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
const userBanByBloggerStaticMethods: UserBanByBloggerModelStaticType = {
  createBannedUser: UserBanByBlogger.createBannedUser,
};
export const UserBanByBloggerSchema =
  SchemaFactory.createForClass(UserBanByBlogger);

UserBanByBloggerSchema.statics = userBanByBloggerStaticMethods;

UserBanByBloggerSchema.methods = {
  updateBannedUser: UserBanByBlogger.prototype.updateBannedUser,
};
