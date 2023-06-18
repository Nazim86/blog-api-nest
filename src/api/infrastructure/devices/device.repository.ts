import { Injectable } from '@nestjs/common';
import { Device, DeviceDocument } from '../../entities/device.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class DeviceRepository {
  constructor(
    @InjectModel(Device.name) private DeviceModel: Model<DeviceDocument>,
  ) {}
  async save(device: DeviceDocument) {
    return device.save();
  }

  async getDevicesByDeviceId(deviceId: string): Promise<DeviceDocument | null> {
    return this.DeviceModel.findOne({ deviceId: deviceId });
  }

  async deleteDeviceByUserId(userId: string) {
    const result = await this.DeviceModel.deleteMany({ userId });
    return result.deletedCount === 1;
  }

  async deleteDevices(deviceId: string): Promise<boolean> {
    const result = await this.DeviceModel.deleteMany({
      deviceId: { $not: { $eq: deviceId } },
    });
    return result.deletedCount === 1;
  }

  async deleteDeviceById(deviceId: string, userId: string) {
    const result = await this.DeviceModel.deleteOne({
      deviceId: deviceId,
      userId: userId,
    });
    return result.deletedCount === 1;
  }

  async checkTokenVersion(
    deviceId: string,
    lastActiveDate: string,
  ): Promise<boolean> {
    const isTokenValid: DeviceDocument | null = await this.DeviceModel.findOne({
      deviceId,
      lastActiveDate,
    });

    if (!isTokenValid) return false;
    return true;
  }
  // async checkTokenVersion(deviceId: string, iat: number): Promise<boolean> {
  //   const lastActiveDate = new Date(iat * 1000).toISOString();
  //   const isTokenValid: DeviceDocument | null = await this.DeviceModel.findOne({
  //     deviceId,
  //     lastActiveDate,
  //   });
  //
  //   if (!isTokenValid) return false;
  //   return true;
  // }

  async deleteOldSession() {
    try {
      const query = { expiration: { $lte: new Date().getTime() } };
      if (!query) {
        return;
      }
      const result = await this.DeviceModel.deleteMany({ query });
      console.log(`${result.deletedCount} expired tokens deleted`);
    } catch (err) {
      console.error(err);
    }
  }
}
