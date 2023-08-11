import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Devices } from '../../entities/devices/devices.entity';

@Injectable()
export class DeviceRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Devices) private readonly deviceRepo: Repository<Devices>,
  ) {}

  async getDevicesByDeviceId(deviceId: string) {
    const device = await this.dataSource.query(
      `SELECT d.*
    FROM public.devices d Where d."deviceId" = $1;`,
      [deviceId],
    );

    return device[0];
  }

  async createDevice(
    lastActiveDate: string,
    deviceId: string,
    ip: string,
    deviceName: string,
    userId: string,
    expiration: string,
  ) {
    return await this.dataSource.query(
      `INSERT INTO public.devices(
            "lastActiveDate", "deviceId", ip, title, "userId", expiration)
            VALUES ($1, $2, $3, $4, $5, $6);`,
      [lastActiveDate, deviceId, ip, deviceName, userId, expiration],
    );
  }

  async updateDevice(deviceId: string, lastActiveDate: string) {
    const result = await this.dataSource.query(
      `UPDATE public.devices
            SET "lastActiveDate"=$1, "deviceId"=$2
            WHERE "deviceId" =$2 ;`,
      [lastActiveDate, deviceId],
    );
    return result[1] === 1;
  }

  async deleteDeviceByUserId(userId: string) {
    const result = await this.deviceRepo
      .createQueryBuilder()
      .delete()
      .from(Devices)
      .where('userId = :userId', { userId: userId })
      .execute();

    //   .query(
    //   `DELETE FROM public.devices d
    //     WHERE d."userId"= $1;`,
    //   [userId],
    // );
    return result.affected === 1;
  }

  async deleteDevices(deviceId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      'DELETE FROM public.devices d WHERE d."deviceId"!=$1;',
      [deviceId],
    );

    return result[1] >= 1;
  }

  async deleteDeviceById(deviceId: string, userId: string) {
    const result = await this.dataSource.query(
      `DELETE FROM public.devices d
                    WHERE d."deviceId"=$1 and d."userId" =$2;`,
      [deviceId, userId],
    );
    return result[1] === 1;
  }

  async checkTokenVersion(
    deviceId: string,
    lastActiveDate: string,
  ): Promise<boolean> {
    const isTokenValid = await this.dataSource.query(
      `SELECT d.*
            FROM public.devices d
            Where d."deviceId" = $1 and d."lastActiveDate" =$2;`,
      [deviceId, lastActiveDate],
    );

    if (!isTokenValid[0]) return false;
    return true;
  }

  // async deleteOldSession() {
  //   try {
  //     const query = { expiration: { $lte: new Date().getTime() } };
  //     if (!query) {
  //       return;
  //     }
  //     const result = await this.DeviceModel.deleteMany({ query });
  //     console.log(`${result.deletedCount} expired tokens deleted`);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }
}
