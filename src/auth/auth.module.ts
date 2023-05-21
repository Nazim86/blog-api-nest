import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { ConfigModule } from '@nestjs/config';
import { BasicStrategy } from './strategies/basic.strategy';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    // JwtModule.register({
    //   secret: refreshTokenSecret.secret,
    //   signOptions: { expiresIn: '20m' },
    // }), //TODO question why we need JwtModule.register if we set expiration time in controller
    MailModule,
  ],
  providers: [AuthService, LocalStrategy, AccessTokenStrategy, BasicStrategy],
  exports: [AuthService],
})
export class AuthModule {}
