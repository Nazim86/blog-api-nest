import { JwtService } from '../../../../jwt/jwt.service';
import { DeviceRepository } from '../../../infrastructure/devices/device.repository';
import { CommandHandler } from '@nestjs/cqrs';
import { Devices } from '../../../entities/devices/devices.entity';
import { UsersRepository } from '../../../infrastructure/users/users.repository';

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

    // const user = await this.usersRepository.findUserById(userId);

    const device = new Devices();
    device.lastActiveDate = lastActiveDate;
    device.deviceId = deviceId;
    device.ip = command.ip;
    device.title = command.deviceName;
    device.user = userId;
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
