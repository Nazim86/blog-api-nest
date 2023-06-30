import { CommandHandler } from '@nestjs/cqrs';
import { DeviceRepository } from '../../../infrastructure/devices/device.repository';

export class DeleteDevicesCommand {
  constructor(public deviceId: string) {}
}

@CommandHandler(DeleteDevicesCommand)
export class DeleteDevicesUseCase {
  constructor(private readonly deviceRepository: DeviceRepository) {}
  async execute(command: DeleteDevicesCommand) {
    return await this.deviceRepository.deleteDevices(command.deviceId);
  }
}
