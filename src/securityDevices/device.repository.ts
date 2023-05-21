import { Injectable } from '@nestjs/common';
import { Device, DeviceDocument } from './domain/device.entity';
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

  async updateDevice(
    deviceId: string,
    lastActiveDate: string,
  ): Promise<boolean> {
    const result = await this.DeviceModel.updateOne(
      { deviceId: deviceId },
      { $set: { lastActiveDate: lastActiveDate } },
    );
    return result.modifiedCount === 1;
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
}
