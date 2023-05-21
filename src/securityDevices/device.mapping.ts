import { DeviceDocument } from './domain/device.entity';
import { DeviceViewType } from '../types/device-view-type';

export const deviceMapping = (
  array: DeviceDocument[],
  ip: string,
): DeviceViewType[] => {
  return array.map((device: DeviceDocument): DeviceViewType => {
    return {
      ip: ip,
      title: device.title,
      lastActiveDate: device.lastActiveDate,
      deviceId: device.deviceId,
    };
  });
};
