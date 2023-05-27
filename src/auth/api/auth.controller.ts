import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Ip,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '../../jwt/jwt.service';
import { AuthService } from '../auth.service';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { DeviceService } from '../../securityDevices/device.service';
import { CreateUserDto } from '../../users/createUser.Dto';
import { exceptionHandler } from '../../exception-handler/exception-handler';
import { ResultCode } from '../../exception-handler/result-code-enum';
import { NewPasswordDto } from '../dto/newPasswordDto';
import { LoginDto } from '../dto/loginDto';
import { UserDocument } from '../../users/domain/user.entity';
import { settings } from '../../settings';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { EmailDto } from '../dto/emailDto';
import { CurrentUserType } from '../../users/infrastructure/types/current-user-type';
import { ConfirmationCodeDto } from '../dto/confirmationCodeDto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    protected jwtService: JwtService,
    protected authService: AuthService,
    protected deviceService: DeviceService,
    protected userRepository: UsersRepository,
  ) {}

  @Throttle()
  @Post('registration')
  @HttpCode(204)
  async userRegistration(@Body() createUserDto: CreateUserDto) {
    const newUser = await this.authService.createNewUser(createUserDto);

    if (newUser) {
      return;
    }
  }

  @Throttle()
  @Post('registration-email-resending')
  @HttpCode(204)
  async reSendRegistrationEmail(@Body() emailDto: EmailDto) {
    const emailResending: string | boolean =
      await this.authService.resendEmailWithNewConfirmationCode(emailDto);
    if (!emailResending) {
      const errorMessage = {
        message: [{ message: 'wrong email', field: 'email' }],
      };
      return exceptionHandler(ResultCode.BadRequest, errorMessage);
    }
    return;
  }

  @Throttle()
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

  @Throttle(5, 10)
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
      '10s',
    );

    const refreshToken = await this.jwtService.createJWT(
      user._id,
      settings.REFRESH_TOKEN_SECRET,
      '20s',
    );

    // const ipAddress = req.ip;
    const deviceName = headers['user-agent'] ?? 'chrome';

    await this.deviceService.createDevice(refreshToken, ip, deviceName);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      //sameSite: 'strict',
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return { accessToken: accessToken };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  @HttpCode(200)
  async getNewRefreshToken(@Request() req, @Response() res) {
    const userId = req.user.userId;

    const deviceId = req.user.deviceId;

    const accessToken = await this.jwtService.createJWT(
      userId,
      settings.ACCESS_TOKEN_SECRET,
      '10m',
      deviceId,
    );
    const refreshToken = await this.jwtService.createJWT(
      userId,
      settings.REFRESH_TOKEN_SECRET,
      '20m',
      deviceId,
    );

    await this.deviceService.updateDevice(refreshToken);

    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        //sameSite: 'strict',
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({ accessToken: accessToken });
  }

  @UseGuards(RefreshTokenGuard)
  @Get('me')
  @HttpCode(200)
  async getCurrentUser(@Request() req) {
    const currentUser: CurrentUserType = await this.authService.getCurrentUser(
      req.user.userId,
    );
    return currentUser;
  }

  @Throttle()
  @Post('password-recovery')
  async sendPasswordRecoveryCode(@Body() emailDto: EmailDto) {
    const isRecoveryEmailSent: boolean =
      await this.authService.sendingRecoveryCode(emailDto);

    if (!isRecoveryEmailSent) {
      return exceptionHandler(ResultCode.BadRequest);
    }
    return;
  }

  @Throttle()
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
  async logout(@Request() req, @Response() res) {
    await this.deviceService.deleteDeviceById(
      req.user.deviceId,
      req.user.userId,
    );

    try {
      res.clearCookie('refreshToken').json();
    } catch (e) {
      return exceptionHandler(ResultCode.Unauthorized);
    }
  }
}
