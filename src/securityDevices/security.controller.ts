import {
  Get,
  HttpCode,
  UseGuards,
  Request,
  Delete,
  Controller,
  Param,
} from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';
import { DeviceService } from './device.service';
import { DeviceViewType } from '../types/device-view-type';
import { RefreshTokenGuard } from '../auth/guards/refresh-token.guard';
import { ResultCode } from '../exception-handler/result-code-enum';
import { exceptionHandler } from '../exception-handler/exception-handler';
import { DeviceQueryRepo } from './device-query.repo';

@Controller('security/devices')
export class SecurityController {
  constructor(
    protected jwtService: JwtService,
    protected securityService: DeviceService,
    protected deviceQueryRepo: DeviceQueryRepo,
  ) {}

  @UseGuards(RefreshTokenGuard)
  @Get()
  @HttpCode(200)
  async getDevices(@Request() req) {
    const devices: DeviceViewType[] = await this.deviceQueryRepo.getDevices(
      req.payload.ip,
      req.payload.userId,
    );
    return devices;
  }

  @UseGuards(RefreshTokenGuard)
  @Delete()
  @HttpCode(204)
  async deleteDevices(@Request() req) {
    const { deviceId } = await this.jwtService.getTokenMetaData(
      req.cookies.refreshToken,
    );
    await this.securityService.deleteDevices(deviceId);
    return;
  }

  @UseGuards(RefreshTokenGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteDeviceByDeviceId(@Param() deviceId, @Request() req) {
    const { userId } = await this.jwtService.getTokenMetaData(
      req.cookies.refreshToken,
    );

    const result = await this.securityService.deleteDeviceById(
      req.params.id,
      userId,
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code);
    }
    return;
  }
}
