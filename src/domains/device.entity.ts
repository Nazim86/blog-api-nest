import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateDeviceDto } from '../api/public/securityDevices/dto/createDeviceDto';

export type DeviceDocument = HydratedDocument<Device>;

export type DeviceModelStaticType = {
  createDevice: (
    createDeviceDto: CreateDeviceDto,
    DeviceModel: DeviceModelType,
  ) => DeviceDocument;
};

export type DeviceModelType = Model<Device> & DeviceModelStaticType;

@Schema()
export class Device {
  @Prop({ type: String, required: true })
  lastActiveDate: string;

  @Prop({ type: String, required: true })
  deviceId: string;

  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  expiration: string;

  static createDevice(
    createDeviceDto: CreateDeviceDto,
    DeviceModel: DeviceModelType,
  ) {
    const newDevice = {
      lastActiveDate: createDeviceDto.lastActiveDate,
      deviceId: createDeviceDto.deviceId,
      ip: createDeviceDto.ip,
      title: createDeviceDto.title,
      userId: createDeviceDto.userId,
      expiration: createDeviceDto.expiration,
    };
    return new DeviceModel(newDevice);
  }

  updateDevice(deviceId: string, lastActiveDate: string) {
    (this.deviceId = deviceId), (this.lastActiveDate = lastActiveDate);
  }
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

const deviceStaticMethods = { createDevice: Device.createDevice };

DeviceSchema.methods = { updateDevice: Device.prototype.updateDevice };

DeviceSchema.statics = deviceStaticMethods;
