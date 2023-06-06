import { Injectable } from '@nestjs/common';
import { JwtService } from '../../../jwt/jwt.service';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceModelType } from './domain/device.entity';
import { DeviceRepository } from './device.repository';
import { settings } from '../../../settings';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { Result } from '../../../exception-handler/result-type';

@Injectable()
export class DeviceService {
  constructor(
    @InjectModel(Device.name) private DeviceModel: DeviceModelType,
    protected jwtService: JwtService,
    protected deviceRepository: DeviceRepository,
  ) {}

  // private deleteOldDevices() {
  //   clearExpiredTokens.start();
  // }

  async createDevice(refreshToken: string, ip: string, deviceName: string) {
    const { deviceId, lastActiveDate, userId, expiration } =
      await this.jwtService.getTokenMetaData(refreshToken);

    const newDevice = this.DeviceModel.createDevice(
      {
        lastActiveDate,
        deviceId,
        ip,
        title: deviceName,
        userId,
        expiration,
      },
      this.DeviceModel,
    );

    await this.deviceRepository.save(newDevice);
  }

  // async getDevices(ip: string, userId: string): Promise<DeviceViewType[]> {
  //   return await this.deviceRepository.getDevices(ip, userId);
  // }

  async updateDevice(refreshToken: string): Promise<boolean> {
    const { deviceId, lastActiveDate } = await this.jwtService.getTokenMetaData(
      refreshToken,
      settings.REFRESH_TOKEN_SECRET,
    );

    return await this.deviceRepository.updateDevice(deviceId, lastActiveDate);
  }

  async deleteDevices(deviceId: string): Promise<boolean> {
    return await this.deviceRepository.deleteDevices(deviceId);
  }

  async deleteDeviceById(
    deviceId: string,
    userId: string,
  ): Promise<Result<boolean | null>> {
    const device = await this.deviceRepository.getDevicesByDeviceId(deviceId);

    if (device && device.userId !== userId) {
      return {
        code: ResultCode.Forbidden,
      };
    }

    const isDeleted = await this.deviceRepository.deleteDeviceById(
      deviceId,
      userId,
    );

    return {
      data: isDeleted,
      code: isDeleted ? ResultCode.Success : ResultCode.NotFound,
    };
  }

  // @Cron(CronExpression.EVERY_SECOND)
  // private async deleteOldSession() {
  //   const result = await this.deviceRepository.deleteOldSession();
  // }
}
