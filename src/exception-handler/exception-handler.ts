import { ResultCode } from './result-code-enum';
import { HttpException } from '@nestjs/common';

export const exceptionHandler = (code: ResultCode, data?: any) => {
  switch (code) {
    case ResultCode.NotFound:
      // return response.sendStatus(404);
      throw new HttpException('Not Found', 404);
    case ResultCode.Forbidden:
      // return response.sendStatus(403);
      throw new HttpException('Forbidden', 403);
    case ResultCode.Unauthorized:
      throw new HttpException('Unauthorized', 401);

    //..
    default:
      return;
  }
};
