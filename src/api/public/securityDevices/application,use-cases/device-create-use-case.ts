import { JwtService } from '../../../../jwt/jwt.service';
import { DeviceRepository } from '../../../infrastructure/devices/device.repository';
import { CommandHandler } from '@nestjs/cqrs';
import { Devices } from '../../../entities/devices/devices.entity';

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

    const device = new Devices();
    device.lastActiveDate = lastActiveDate;
    device.deviceId = deviceId;
    device.ip = command.ip;
    device.title = command.deviceName;
    device.user = userId; //TODO will not work I think
    device.expiration = expiration;

    // await this.deviceRepository.createDevice(
    //   lastActiveDate,
    //   deviceId,
    //   command.ip,
    //   command.deviceName,
    //   userId,
    //   expiration,
    // );

    await this.deviceRepository.saveDevice(device);

    return;
  }
}
