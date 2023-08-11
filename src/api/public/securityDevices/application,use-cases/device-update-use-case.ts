import { JwtService } from '../../../../jwt/jwt.service';
import { DeviceRepository } from '../../../infrastructure/devices/device.repository';
import { CommandHandler } from '@nestjs/cqrs';
import { settings } from '../../../../settings';

export class DeviceUpdateCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(DeviceUpdateCommand)
export class DeviceUpdateUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly deviceRepository: DeviceRepository,
  ) {}
  async execute(command: DeviceUpdateCommand): Promise<boolean> {
    const { deviceId, lastActiveDate } = await this.jwtService.getTokenMetaData(
      command.refreshToken,
      settings.REFRESH_TOKEN_SECRET,
    );

    const device = await this.deviceRepository.getDevicesByDeviceId(deviceId);

    if (!device) return false;

    device.lastActiveDate = lastActiveDate;
    device.deviceId = deviceId;

    await this.deviceRepository.saveDevice(device);

    // const isDeviceUpdated = await this.deviceRepository.updateDevice(
    //   deviceId,
    //   lastActiveDate,
    // );

    return;
  }
}
