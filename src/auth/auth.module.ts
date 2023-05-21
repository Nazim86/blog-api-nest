import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { ConfigModule } from '@nestjs/config';
import { BasicStrategy } from './strategies/basic.strategy';
import { MailModule } from '../mail/mail.module';
import { DeviceRepository } from '../securityDevices/device.repository';
import { MailService } from '../mail/mail.service';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/domain/user.entity';
import { JwtService } from '../jwt/jwt.service';
import { Device, DeviceSchema } from '../securityDevices/domain/device.entity';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),

    // JwtModule.register({
    //   secret: refreshTokenSecret.secret,
    //   signOptions: { expiresIn: '20m' },
    // }), //TODO question why we need JwtModule.register if we set expiration time in controller
    MailModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    AccessTokenStrategy,
    BasicStrategy,
    DeviceRepository,
    MailService,
    UsersRepository,
    JwtService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
