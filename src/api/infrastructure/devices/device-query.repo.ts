import { DeviceViewType } from '../../../types/device-view-type';
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Devices } from '../../entities/devices/devices.entity';

@Injectable()
export class DeviceQueryRepo {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Devices)
    private readonly devicesRepo: Repository<Devices>,
  ) {}

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
    const device = await this.devicesRepo
      .createQueryBuilder('d')
      .where('d.userId = :userId', { userId: userId })
      .getMany();

    // const device = await this.dataSource.query(
    //   `SELECT d.*
    //                 FROM public.devices d
    //                 Where d."userId"=$1;`,
    //   [userId],
    // );
    //console.log('device before map', device);
    return this.deviceMapping(device, ip);
  }
}
