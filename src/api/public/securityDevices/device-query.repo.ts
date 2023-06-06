import { DeviceViewType } from '../../../types/device-view-type';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocument } from './domain/device.entity';
import { Model } from 'mongoose';
import { deviceMapping } from './device.mapping';

@Injectable()
export class DeviceQueryRepo {
  constructor(
    @InjectModel(Device.name) private DeviceModel: Model<DeviceDocument>,
  ) {}
  async getDevices(ip: string, userId: string): Promise<DeviceViewType[]> {
    const device: DeviceDocument[] = await this.DeviceModel.find({
      userId: userId,
    });
    const mappedDevices: DeviceViewType[] = deviceMapping(device, ip);
    return mappedDevices;
  }
}
