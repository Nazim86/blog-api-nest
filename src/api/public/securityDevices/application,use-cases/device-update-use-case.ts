import { JwtService } from '../../../../jwt/jwt.service';
import { DeviceDocument } from '../../../../domains/device.entity';
import { DeviceRepository } from '../infrastructure/device.repository';
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

    const device: DeviceDocument =
      await this.deviceRepository.getDevicesByDeviceId(deviceId);

    if (!device) return false;

    device.updateDevice(deviceId, lastActiveDate);

    await this.deviceRepository.save(device);

    return;
  }
}
