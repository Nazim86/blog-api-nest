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
import { AuthService } from '../auth.service';
import { UsersRepository } from '../../../superadmin/users/infrastructure/users.repository';
import { DeviceService } from '../../securityDevices/device.service';
import { CreateUserDto } from '../../../superadmin/users/createUser.Dto';
import { exceptionHandler } from '../../../../exception-handler/exception-handler';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { NewPasswordDto } from '../dto/newPasswordDto';
import { LoginDto } from '../dto/loginDto';
import { UserDocument } from '../../../../domains/user.entity';
import { settings } from '../../../../settings';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { EmailDto } from '../dto/emailDto';
import { CurrentUserType } from '../../../superadmin/users/infrastructure/types/current-user-type';
import { ConfirmationCodeDto } from '../dto/confirmationCodeDto';
import { Throttle } from '@nestjs/throttler';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { UserId } from '../../../../decorators/UserId';
import { RefreshToken } from '../../../../decorators/RefreshToken';
import { DeviceId } from '../../../../decorators/DeviceId';
import { CommandBus } from '@nestjs/cqrs';
import { DeviceCreateCommand } from '../../securityDevices/application,use-cases/device-create-use-case';
import { DeviceUpdateCommand } from '../../securityDevices/application,use-cases/device-update-use-case';
import { DeviceDeleteByIdCommand } from '../../securityDevices/application,use-cases/device-deleteByDeviceId-use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly deviceService: DeviceService,
    private readonly userRepository: UsersRepository,
    private commandBus: CommandBus,
  ) {}

  //@Throttle(5, 10)
  @Post('registration')
  @HttpCode(204)
  async userRegistration(@Body() createUserDto: CreateUserDto) {
    const newUser = await this.authService.createNewUser(createUserDto);

    if (newUser) {
      return;
    }
  }

  //@Throttle(5, 10)
  @Post('registration-email-resending')
  @HttpCode(204)
  async reSendRegistrationEmail(@Body() emailDto: EmailDto) {
    const isEmailSent: boolean =
      await this.authService.resendEmailWithNewConfirmationCode(emailDto);
    if (!isEmailSent) {
      const errorMessage = {
        message: [{ message: 'wrong email', field: 'email' }],
      };
      return exceptionHandler(ResultCode.BadRequest, errorMessage);
    }
    return;
  }

  //@Throttle(5, 10)
  @Post('registration-confirmation')
  @HttpCode(204)
  async confirmRegistration(@Body() confirmationCodeDto: ConfirmationCodeDto) {
    const registrationConfirmation: boolean =
      await this.authService.registrationConfirmation(confirmationCodeDto);

    if (!registrationConfirmation) {
      const errorMessage = {
        message: [{ message: 'wrong code', field: 'code' }],
      };

      return exceptionHandler(ResultCode.BadRequest, errorMessage);
    }
    return;
  }

  //@Throttle(5, 10)
  @Post('login')
  @HttpCode(200)
  async login(
    @Response({ passthrough: true }) res,
    @Body() loginDto: LoginDto,
    @Ip() ip,
    @Headers() headers,
  ) {
    const user: UserDocument | null = await this.authService.checkCredentials(
      loginDto,
    );

    if (!user) {
      return exceptionHandler(ResultCode.Unauthorized);
    }

    const accessToken = await this.jwtService.createJWT(
      user.id!,
      settings.ACCESS_TOKEN_SECRET,
      '10h',
    );

    const refreshToken = await this.jwtService.createJWT(
      user._id,
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

    if (!isTokenValid) {
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
    const currentUser: CurrentUserType = await this.authService.getCurrentUser(
      userId,
    );
    return currentUser;
  }

  //@Throttle(5, 10)
  @Post('password-recovery')
  async sendPasswordRecoveryCode(@Body() emailDto: EmailDto) {
    const isRecoveryEmailSent: boolean =
      await this.authService.sendingRecoveryCode(emailDto);

    if (!isRecoveryEmailSent) {
      return exceptionHandler(ResultCode.BadRequest);
    }
    return;
  }

  //@Throttle(5, 10)
  @Post('new-password')
  @HttpCode(204)
  async setNewPassword(@Body() newPasswordDto: NewPasswordDto) {
    const isNewPasswordSet: boolean =
      await this.authService.setNewPasswordByRecoveryCode(newPasswordDto);

    if (!isNewPasswordSet) {
      return exceptionHandler(ResultCode.BadRequest);
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

    if (!isTokenValid) {
      return exceptionHandler(ResultCode.Unauthorized);
    }

    await this.commandBus.execute(
      new DeviceDeleteByIdCommand(deviceId, userId),
    );

    try {
      res.clearCookie('refreshToken').json();
    } catch (e) {
      return exceptionHandler(ResultCode.Unauthorized);
    }
  }
}
