import { DeviceRepository } from '../../../infrastructure/devices/device.repository';
import { CommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../exception-handler/result-type';
import { ResultCode } from '../../../../exception-handler/result-code-enum';

export class DeviceDeleteByIdCommand {
  constructor(public deviceId: string, public userId: string) {}
}

@CommandHandler(DeviceDeleteByIdCommand)
export class DeviceDeleteByIdUseCase {
  constructor(private readonly deviceRepository: DeviceRepository) {}
  async execute(
    deviceId: string,
    userId: string,
  ): Promise<Result<boolean | null>> {
    const device = await this.deviceRepository.getDevicesByDeviceId(deviceId);

    if (device && device.userId !== userId) {
      return {
        code: ResultCode.Forbidden,
      };
    }

    const isDeleted = await this.deviceRepository.deleteDeviceById(
      deviceId,
      userId,
    );

    return {
      data: isDeleted,
      code: isDeleted ? ResultCode.Success : ResultCode.NotFound,
    };
  }
}
