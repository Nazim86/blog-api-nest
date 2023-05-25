import { ResultCode } from './result-code-enum';
import { HttpException } from '@nestjs/common';

export const exceptionHandler = (code: ResultCode, data?: any) => {
  switch (code) {
    case ResultCode.NotFound:
      throw new HttpException('Not Found', 404);
    case ResultCode.Forbidden:
      throw new HttpException('Forbidden', 403);
    case ResultCode.Unauthorized:
      throw new HttpException('Unauthorized', 401);
    case ResultCode.BadRequest:
      throw new HttpException(data, 400);

    //..
    default:
      return;
  }
};
