import { BadRequestException } from '@nestjs/common';

export const exceptionImageFactory = (error) => {
  throw new BadRequestException([{ message: error, field: 'image' }]);
};
