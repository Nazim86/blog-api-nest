import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../../superadmin/users/users.module';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { ConfigModule } from '@nestjs/config';
import { BasicStrategy } from './strategies/basic.strategy';
import { MailModule } from '../../../mail/mail.module';
import { DeviceRepository } from '../../infrastructure/devices/device.repository';
import { MailService } from '../../../mail/mail.service';
import { UsersRepository } from '../../infrastructure/users/users.repository';
import { JwtService } from '../../../jwt/jwt.service';
import { DeleteController } from '../../../delete/delete.controller';
import { AuthController } from './api/auth.controller';
import { UserQueryRepo } from '../../infrastructure/users/users.query.repo';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { DevicesController } from '../securityDevices/api/devices.controller';
import { DeviceQueryRepo } from '../../infrastructure/devices/device-query.repo';
import { ScheduleModule } from '@nestjs/schedule';
import { SuperAdminUsersController } from '../../superadmin/users/sa.users.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { DeviceCreateUseCase } from '../securityDevices/application,use-cases/device-create-use-case';
import { DeviceUpdateUseCase } from '../securityDevices/application,use-cases/device-update-use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../../entities/users/user.entity';
import { UsersBanBySa } from '../../entities/users/users-ban-by-sa.entity';
import { Devices } from '../../entities/devices/devices.entity';
import { Blogs } from '../../entities/blogs/blogs.entity';
import { EmailConfirmation } from '../../entities/users/email-confirmation.entity';
import { PasswordRecovery } from '../../entities/users/password-recovery.entity';
import { UsersBanByBlogger } from '../../entities/users/usersBanByBlogger.entity';

const useCases = [DeviceCreateUseCase, DeviceUpdateUseCase];
@Module({
  imports: [
    // ThrottlerModule.forRoot({
    //   ttl: 1,
    //   limit: 1000,
    // }),
    ScheduleModule.forRoot(),
    UsersModule,
    PassportModule,
    ConfigModule,
    MailModule,
    CqrsModule,
    TypeOrmModule.forFeature([
      Users,
      UsersBanBySa,
      Devices,
      Blogs,
      EmailConfirmation,
      PasswordRecovery,
      UsersBanByBlogger,
    ]),
  ],
  providers: [
    LocalStrategy,
    AccessTokenStrategy,
    BasicStrategy,
    DeviceRepository,
    MailService,
    UsersRepository,
    JwtService,
    UserQueryRepo,
    RefreshTokenStrategy,
    DeviceQueryRepo,
    UsersRepository,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
    ...useCases,
  ],

  controllers: [
    AuthController,
    SuperAdminUsersController,
    DeleteController,
    DevicesController,
  ],
  exports: [],
})
export class AuthModule {}
