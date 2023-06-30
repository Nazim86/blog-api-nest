import { JwtService } from '../../../../jwt/jwt.service';
import { DeviceRepository } from '../../../infrastructure/devices/device.repository';
import { CommandHandler } from '@nestjs/cqrs';

export class DeviceCreateCommand {
  constructor(
    public refreshToken: string,
    public ip: string,
    public deviceName: string,
  ) {}
}

@CommandHandler(DeviceCreateCommand)
export class DeviceCreateUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly deviceRepository: DeviceRepository,
  ) {}
  async execute(command: DeviceCreateCommand) {
    const { deviceId, lastActiveDate, userId, expiration } =
      await this.jwtService.getTokenMetaData(command.refreshToken);

    await this.deviceRepository.createDevice(
      lastActiveDate,
      deviceId,
      command.ip,
      command.deviceName,
      userId,
      expiration,
    );

    return;
  }
}
