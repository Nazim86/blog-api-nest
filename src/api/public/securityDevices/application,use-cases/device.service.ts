import { Injectable } from '@nestjs/common';
import { JwtService } from '../../../../jwt/jwt.service';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceModelType } from '../../../../domains/device.entity';
import { DeviceRepository } from '../infrastructure/device.repository';

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

  // async getDevices(ip: string, userId: string): Promise<DeviceViewType[]> {
  //   return await this.deviceRepository.getDevices(ip, userId);
  // }

  async deleteDevices(deviceId: string): Promise<boolean> {
    return await this.deviceRepository.deleteDevices(deviceId);
  }

  // @Cron(CronExpression.EVERY_SECOND)
  // private async deleteOldSession() {
  //   const result = await this.deviceRepository.deleteOldSession();
  // }
}
