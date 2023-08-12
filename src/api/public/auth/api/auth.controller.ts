import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Ip,
  Post,
  Response,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '../../../../jwt/jwt.service';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { CreateUserDto } from '../../../superadmin/users/dto/createUser.Dto';
import { exceptionHandler } from '../../../../exception-handler/exception-handler';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { NewPasswordDto } from '../dto/newPasswordDto';
import { LoginDto } from '../dto/loginDto';
import { settings } from '../../../../settings';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { EmailDto } from '../dto/emailDto';
import { CurrentUserType } from '../../../infrastructure/users/types/current-user-type';
import { ConfirmationCodeDto } from '../dto/confirmationCodeDto';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { UserId } from '../../../../decorators/UserId';
import { RefreshToken } from '../../../../decorators/RefreshToken';
import { DeviceId } from '../../../../decorators/DeviceId';
import { CommandBus } from '@nestjs/cqrs';
import { DeviceCreateCommand } from '../../securityDevices/application,use-cases/device-create-use-case';
import { DeviceUpdateCommand } from '../../securityDevices/application,use-cases/device-update-use-case';
import { DeviceDeleteByIdCommand } from '../../securityDevices/application,use-cases/device-deleteByDeviceId-use-case';
import { CreateUserCommand } from '../application,use-cases/create-user-use-case';
import { RegistrationConfirmationCommand } from '../application,use-cases/registration-confirmation-use-case';
import { ResendEmailCommand } from '../application,use-cases/resend-email-use-case';
import { SendRecoveryCodeCommand } from '../application,use-cases/send-recovery-code-use-case';
import { SetNewPasswordCommand } from '../application,use-cases/set-new-password-use-case';
import { CheckCredentialsCommand } from '../application,use-cases/check-credentials-use-case';
import { CurrentUserCommand } from '../application,use-cases/current-user-use-case';
import { Result } from '../../../../exception-handler/result-type';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UsersRepository,
    private commandBus: CommandBus,
  ) {}

  @Throttle(5, 10)
  @Post('registration')
  @HttpCode(204)
  async userRegistration(@Body() createUserDto: CreateUserDto) {
    const userId = await this.commandBus.execute(
      new CreateUserCommand(createUserDto),
    );

    if (userId) {
      return;
    }
  }

  @Throttle(5, 10)
  @Post('registration-email-resending')
  @HttpCode(204)
  async reSendRegistrationEmail(@Body() emailDto: EmailDto) {
    const isEmailSent: boolean = await this.commandBus.execute(
      new ResendEmailCommand(emailDto),
    );

    if (!isEmailSent) {
      const errorMessage = {
        message: [{ message: 'wrong email', field: 'email' }],
      };
      return exceptionHandler(ResultCode.BadRequest, errorMessage);
    }
    return;
  }

  @Throttle(5, 10)
  @Post('registration-confirmation')
  @HttpCode(204)
  async confirmRegistration(@Body() confirmationCodeDto: ConfirmationCodeDto) {
    const registrationConfirmation: boolean = await this.commandBus.execute(
      new RegistrationConfirmationCommand(confirmationCodeDto),
    );

    if (!registrationConfirmation) {
      const errorMessage = {
        message: [{ message: 'wrong code', field: 'code' }],
      };

      return exceptionHandler(ResultCode.BadRequest, errorMessage);
    }
    return;
  }

  @Throttle(5, 10)
  @Post('login')
  @HttpCode(200)
  async login(
    @Response({ passthrough: true }) res,
    @Body() loginDto: LoginDto,
    @Ip() ip,
    @Headers() headers,
  ) {
    const user = await this.commandBus.execute(
      new CheckCredentialsCommand(loginDto),
    );

    if (!user) {
      return exceptionHandler(ResultCode.Unauthorized);
    }

    const accessToken = await this.jwtService.createJWT(
      user.id,
      settings.ACCESS_TOKEN_SECRET,
      '10h',
    );

    const refreshToken = await this.jwtService.createJWT(
      user.id,
      settings.REFRESH_TOKEN_SECRET,
      '20h',
    );

    // const ipAddress = req.ip;
    const deviceName = headers['user-agent'] ?? 'chrome';

    await this.commandBus.execute(
      new DeviceCreateCommand(refreshToken, ip, deviceName),
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return { accessToken: accessToken };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  @HttpCode(200)
  async getNewRefreshToken(
    @UserId() userId,
    @RefreshToken() refreshToken,
    @DeviceId() deviceId,
    @Response() res,
  ) {
    const isTokenValid = await this.jwtService.checkTokenVersion(refreshToken);

    if (!isTokenValid || !userId || !deviceId) {
      return exceptionHandler(ResultCode.Unauthorized);
    }

    const newAccessToken = await this.jwtService.createJWT(
      userId,
      settings.ACCESS_TOKEN_SECRET,
      '10h',
      deviceId,
    );
    const newRefreshToken = await this.jwtService.createJWT(
      userId,
      settings.REFRESH_TOKEN_SECRET,
      '20h',
      deviceId,
    );

    await this.commandBus.execute(new DeviceUpdateCommand(newRefreshToken));

    res
      .cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({ accessToken: newAccessToken });
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  @HttpCode(200)
  async getCurrentUser(@UserId() userId) {
    const currentUser: CurrentUserType = await this.commandBus.execute(
      new CurrentUserCommand(userId),
    );
    return currentUser;
  }

  @Throttle(5, 10)
  @Post('password-recovery')
  @HttpCode(204)
  async sendPasswordRecoveryCode(@Body() emailDto: EmailDto) {
    const isRecoveryEmailSent: Result<any> = await this.commandBus.execute(
      new SendRecoveryCodeCommand(emailDto),
    );

    if (isRecoveryEmailSent.code !== ResultCode.Success) {
      return exceptionHandler(
        isRecoveryEmailSent.code,
        isRecoveryEmailSent.data,
      );
    }

    return;
  }

  @Throttle(5, 10)
  @Post('new-password')
  @HttpCode(204)
  async setNewPassword(@Body() newPasswordDto: NewPasswordDto) {
    const isNewPasswordSet: Result<any> = await this.commandBus.execute(
      new SetNewPasswordCommand(newPasswordDto),
    );

    console.log('isNewPasswordSet', isNewPasswordSet);
    if (isNewPasswordSet.code !== ResultCode.Success) {
      return exceptionHandler(isNewPasswordSet.code, isNewPasswordSet.data);
    }

    return;
  }

  @UseGuards(RefreshTokenGuard)
  @Post('logout')
  @HttpCode(204)
  async logout(
    @UserId() userId,
    @DeviceId() deviceId,
    @RefreshToken() refreshToken,
    @Response() res,
  ) {
    const isTokenValid = await this.jwtService.checkTokenVersion(refreshToken);

    if (!isTokenValid || !userId || !deviceId) {
      return exceptionHandler(ResultCode.Unauthorized);
    }

    const isDeviceDeleted = await this.commandBus.execute(
      new DeviceDeleteByIdCommand(deviceId, userId),
    );

    if (isDeviceDeleted.code !== ResultCode.Success) {
      return exceptionHandler(isDeviceDeleted.code);
    }

    try {
      res.clearCookie('refreshToken').json();
    } catch (e) {
      return exceptionHandler(ResultCode.Unauthorized);
    }
  }
}
