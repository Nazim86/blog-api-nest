import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
export const configModule = ConfigModule.forRoot({ isGlobal: true });
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BloggerBlogsController } from './api/blogger/blogger.blogs.controller';
import { BlogsQueryRepo } from './api/infrastructure/blogs/blogs-query.repository';
import { PostsQueryRepo } from './api/infrastructure/posts/posts-query-repo';
import { BlogRepository } from './api/infrastructure/blogs/blog.repository';
import { PostsController } from './api/public/post/api/posts.controller';
import { PostRepository } from './api/infrastructure/posts/post.repository';
import { CommentsQueryRepo } from './api/infrastructure/comments/comments.query.repo';
import { UserQueryRepo } from './api/infrastructure/users/users.query.repo';
import { UsersRepository } from './api/infrastructure/users/users.repository';
import { DeleteController } from './delete/delete.controller';
import * as process from 'process';
import { AuthModule } from './api/public/auth/auth.module';
import { UsersModule } from './api/superadmin/users/users.module';
import { LikesRepository } from './api/infrastructure/likes/likes.repository';
import { CommentsRepository } from './api/infrastructure/comments/comments.repository';
import { MailModule } from './mail/mail.module';
import { JwtService } from './jwt/jwt.service';
import { CommentsController } from './api/public/comments/api/comments.controller';
import { IsBlogExistConstraint } from './decorators/IsBlogIdExist';
import { ScheduleModule } from '@nestjs/schedule';
import { DeviceRepository } from './api/infrastructure/devices/device.repository';
import { SuperAdminBlogsController } from './api/superadmin/blogs/sa.blogs.controller';
import { BlogCreateUseCase } from './api/blogger/application,use-cases/blog-create-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogUpdateUseCase } from './api/blogger/application,use-cases/blog-update-use-case';
import { BindBlogUseCase } from './api/superadmin/blogs/use-cases/bind-blog-use-case';
import { SuperAdminUsersController } from './api/superadmin/users/sa.users.controller';
import { BanUserUseCase } from './api/superadmin/users/application,use-cases/ban-user-use-case';
import { CreateUsersUseCase } from './api/superadmin/users/application,use-cases/create-user-use-case';
import { PostCreateUseCase } from './api/blogger/application,use-cases/post-create-use-case';
import { PostUpdateUseCase } from './api/blogger/application,use-cases/post-update-use-case';
import { BlogDeleteUseCase } from './api/blogger/application,use-cases/blog-delete-use-case';
import { PostDeleteUseCase } from './api/blogger/application,use-cases/post-delete-use-case';
import { DeviceUpdateUseCase } from './api/public/securityDevices/application,use-cases/device-update-use-case';
import { DeviceCreateUseCase } from './api/public/securityDevices/application,use-cases/device-create-use-case';
import { PostLikeUpdateUseCase } from './api/public/like/use-cases/post-like-update-use-case';
import { CommentUpdateUseCase } from './api/public/comments/application,use-cases/comment-update-use-case';
import { CommentCreateUseCase } from './api/public/comments/application,use-cases/comment-create-use-case';
import { CommentDeleteUseCase } from './api/public/comments/application,use-cases/comment-delete-use-case';
import { CommentLikeStatusUpdateUseCase } from './api/public/like/use-cases/comment-like-status-update-use-case';
import { PublicBlogsController } from './api/public/blogs/api/public.blogs.controller';
import { BloggerBanUserUseCase } from './api/blogger/application,use-cases/blogger-ban-user-use-case';
import { BloggerUsersController } from './api/blogger/blogger.users.controller';
import { BanBlogUseCase } from './api/superadmin/blogs/use-cases/ban-blog-use-case';
import { CheckCredentialsUseCase } from './api/public/auth/application,use-cases/check-credentials-use-case';
import { CurrentUserUseCase } from './api/public/auth/application,use-cases/current-user-use-case';
import { ResendEmailUseCase } from './api/public/auth/application,use-cases/resend-email-use-case';
import { SendRecoveryCodeUseCase } from './api/public/auth/application,use-cases/send-recovery-code-use-case';
import { SetNewPasswordUseCase } from './api/public/auth/application,use-cases/set-new-password-use-case';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DeleteUserUseCase } from './api/superadmin/users/application,use-cases/delete-user-use-case';
import { CreateUserUseCase } from './api/public/auth/application,use-cases/create-user-use-case';
import { RegistrationConfirmationUseCase } from './api/public/auth/application,use-cases/registration-confirmation-use-case';
import { DeviceDeleteByIdUseCase } from './api/public/securityDevices/application,use-cases/device-deleteByDeviceId-use-case';
import { DeleteDevicesUseCase } from './api/public/securityDevices/application,use-cases/delete-devices-use-case';
import { UsersBanBySa } from './api/entities/users/users-ban-by-sa.entity';
import { EmailConfirmation } from './api/entities/users/email-confirmation.entity';
import { Users } from './api/entities/users/user.entity';
import { PasswordRecovery } from './api/entities/users/password-recovery.entity';
import { Posts } from './api/entities/posts/posts.entity';
import { CommentLike } from './api/entities/like/commentLike.entity';
import { Comments } from './api/entities/comments/comments.entity';
import { PostLike } from './api/entities/like/postLike.entity';
import { Devices } from './api/entities/devices/devices.entity';
import { Blogs } from './api/entities/blogs/blogs.entity';
import { UsersBanByBlogger } from './api/entities/users/usersBanByBlogger.entity';
import { BlogBanInfo } from './api/entities/blogs/blogBanInfo.entity';
import { SaBloggerBlogsController } from './api/superadmin/blogs/sa.blogger.blogs.controller';
import { GamePairEntity } from './api/entities/quiz/gamePair.entity';
import { SAQuizQuestionsController } from './api/superadmin/quiz/api/sa.quiz.questions.controller';
import { AnswersEntity } from './api/entities/quiz/answers.entity';
import { QuestionsEntity } from './api/entities/quiz/questions.entity';
import { CreateQuestionUseCase } from './api/superadmin/quiz/use-cases/create-question-use-case';
import { QuestionsRepository } from './api/infrastructure/quiz/questions.repository';
import { QuestionsQueryRepository } from './api/infrastructure/quiz/questions.query.repository';
import { UpdateQuestionUseCase } from './api/superadmin/quiz/use-cases/update-question-use-case';
import { PublishQuestionUseCase } from './api/superadmin/quiz/use-cases/publish-question-use-case';
import { DeleteQuestionUseCase } from './api/superadmin/quiz/use-cases/delete-question-use-case';
import { PublicQuizController } from './api/public/quiz/public.quiz.controller';
import { UpdateGamePairUseCase } from './api/public/quiz/applications,use-cases/update.gamePair.use-case';
import { QuizQueryRepository } from './api/infrastructure/quiz/quiz.query.repository';
import { QuizRepository } from './api/infrastructure/quiz/quiz.repository';
import { CreateConnectionService } from './api/public/quiz/applications,use-cases/create-connection.service';
import { CreateAnswerUseCase } from './api/public/quiz/applications,use-cases/create.answer.use-case';
import { CreateGamePairUseCase } from './api/public/quiz/applications,use-cases/create.gamePair.use-case';
import { TransactionRepository } from './api/infrastructure/common/transaction.repository';
import { PlayersEntity } from './api/entities/quiz/players.entity';
import { GamesQueryRepo } from './api/infrastructure/quiz/games.query.repo';
import { FinishGameUseCase } from './api/public/quiz/applications,use-cases/finishGame.use-case';
import { S3StorageAdapter } from './common/s3-storage-adapter';
import { BlogWallpaperImageUseCase } from './api/blogger/application,use-cases/blog-wallpaper-image-use-case';
import { BlogWallpaperImage } from './api/entities/blogs/blogWallpaperImage.entity';
import { BlogMainImage } from './api/entities/blogs/blogMainImage.entity';
import { BlogMainImageUseCase } from './api/blogger/application,use-cases/blog-main-image-use-case';

const useCases = [
  BlogCreateUseCase,
  BlogUpdateUseCase,
  BindBlogUseCase,
  BanUserUseCase,
  CreateUsersUseCase,
  PostCreateUseCase,
  PostUpdateUseCase,
  BlogDeleteUseCase,
  PostDeleteUseCase,
  DeviceUpdateUseCase,
  DeviceCreateUseCase,
  PostLikeUpdateUseCase,
  CommentUpdateUseCase,
  CommentCreateUseCase,
  CommentDeleteUseCase,
  CommentLikeStatusUpdateUseCase,
  BloggerBanUserUseCase,
  BanBlogUseCase,
  CheckCredentialsUseCase,
  CurrentUserUseCase,
  ResendEmailUseCase,
  SendRecoveryCodeUseCase,
  SetNewPasswordUseCase,
  DeleteUserUseCase,
  CreateUserUseCase,
  RegistrationConfirmationUseCase,
  DeviceDeleteByIdUseCase,
  DeleteDevicesUseCase,
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  PublishQuestionUseCase,
  DeleteQuestionUseCase,
  CreateGamePairUseCase,
  UpdateGamePairUseCase,
  CreateAnswerUseCase,
  FinishGameUseCase,
  BlogWallpaperImageUseCase,
  BlogMainImageUseCase,
];

const entities = [
  Users,
  UsersBanBySa,
  EmailConfirmation,
  PasswordRecovery,
  CommentLike,
  PostLike,
  Comments,
  Posts,
  Devices,
  Blogs,
  UsersBanByBlogger,
  BlogBanInfo,
  GamePairEntity,
  AnswersEntity,
  QuestionsEntity,
  PlayersEntity,
  BlogMainImage,
  BlogWallpaperImage,
];

export const neonConfigForTypeOrm: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.PG_HOST, //localhost
  //port: 5432,
  username: process.env.PG_USER,
  password: process.env.PG_PASS,
  entities,
  ssl: true,
  database: process.env.PG_DATABASE,
  autoLoadEntities: true,
  synchronize: false,
};

export const localConfigTypeOrm: TypeOrmModuleOptions = {
  type: 'postgres',
  //schema: 'public', // Specify your schema here
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'sa',
  database: 'blog-api-nest-rawSql',
  autoLoadEntities: true,
  synchronize: false,
};

@Module({
  imports: [
    configModule,
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    TypeOrmModule.forRoot(localConfigTypeOrm),
    TypeOrmModule.forFeature(entities),
    MailModule,
    CqrsModule,
  ],

  controllers: [
    AppController,
    BloggerBlogsController,
    PostsController,
    SuperAdminUsersController,
    DeleteController,
    CommentsController,
    SuperAdminBlogsController,
    SuperAdminUsersController,
    PublicBlogsController,
    BloggerUsersController,
    SaBloggerBlogsController,
    SAQuizQuestionsController,
    PublicQuizController,
  ],
  providers: [
    AppService,
    BlogsQueryRepo,
    BlogRepository,
    PostsQueryRepo,
    PostRepository,
    CommentsQueryRepo,
    CommentsRepository,
    UserQueryRepo,
    UsersRepository,
    LikesRepository,
    JwtService,
    IsBlogExistConstraint,
    DeviceRepository,
    QuestionsRepository,
    QuestionsQueryRepository,
    QuizRepository,
    QuizQueryRepository,
    CreateConnectionService,
    TransactionRepository,
    GamesQueryRepo,
    S3StorageAdapter,
    ...useCases,
  ],
  exports: [TypeOrmModule],
})
export class AppModule {}
