import { JwtService } from '../../../../jwt/jwt.service';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceModelType } from '../domain/device.entity';
import { DeviceRepository } from '../device.repository';
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

    @InjectModel(Device.name) private DeviceModel: DeviceModelType,
  ) {}
  async execute(command: DeviceCreateCommand) {
    const { deviceId, lastActiveDate, userId, expiration } =
      await this.jwtService.getTokenMetaData(command.refreshToken);

    const newDevice = this.DeviceModel.createDevice(
      {
        lastActiveDate,
        deviceId,
        ip: command.ip,
        title: command.deviceName,
        userId,
        expiration,
      },
      this.DeviceModel,
    );

    await this.deviceRepository.save(newDevice);
  }
}
