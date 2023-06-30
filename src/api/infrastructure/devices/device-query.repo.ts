import { DeviceViewType } from '../../../types/device-view-type';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DeviceQueryRepo {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private deviceMapping = (array, ip: string): DeviceViewType[] => {
    return array.map((device): DeviceViewType => {
      return {
        ip: ip,
        title: device.title,
        lastActiveDate: device.lastActiveDate,
        deviceId: device.deviceId,
      };
    });
  };
  async getDevices(ip: string, userId: string): Promise<DeviceViewType[]> {
    const device = await this.dataSource.query(
      `SELECT d.* 
                    FROM public.devices d
                    Where d."userId"=$1;`,
      [userId],
    );

    const mappedDevices: DeviceViewType[] = this.deviceMapping(device, ip);
    return mappedDevices;
  }
}
