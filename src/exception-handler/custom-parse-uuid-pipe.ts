import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ParseUUIDPipe } from '@nestjs/common';

@Injectable()
export class CustomParseUUIDPipe
  extends ParseUUIDPipe
  implements PipeTransform<string, Promise<string>>
{
  constructor() {
    super(); // Call the constructor of ParseUUIDPipe
  }

  async transform(value: string, metadata: ArgumentMetadata): Promise<string> {
    try {
      return await super.transform(value, metadata); // Use the parent class's transform method
    } catch (error) {
      // Catch the error thrown by ParseUUIDPipe and provide a custom error message
      throw new BadRequestException({
        message: [{ message: 'wrong uuid format', field: 'id' }],
      });
    }
  }
}
