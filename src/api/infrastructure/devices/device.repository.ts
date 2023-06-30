import { Injectable } from '@nestjs/common';
import { Device, DeviceDocument } from '../../entities/device.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DeviceRepository {
  constructor(
    @InjectModel(Device.name) private DeviceModel: Model<DeviceDocument>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}
  async save(device: DeviceDocument) {
    return device.save();
  }

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
    const result = await this.dataSource.query(
      `DELETE FROM public.devices d
        WHERE d."userId"= $1;`,
      [userId],
    );
    return result[1] === 1;
  }

  async deleteDevices(deviceId: string): Promise<boolean> {
    const result = await this.DeviceModel.deleteMany({
      deviceId: { $not: { $eq: deviceId } },
    });
    return result.deletedCount === 1;
  }

  async deleteDeviceById(deviceId: string, userId: string) {
    const result = await this.dataSource.query(
      `DELETE FROM public.devices d
                    WHERE d."deviceId"=$1 and d."userId" =$2;`,
      [deviceId, userId],
    );
    console.log(result);
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
