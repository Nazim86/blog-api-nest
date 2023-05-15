import { ResultCode } from './result-code-enum';

export type Result<T> = {
  code: ResultCode;
  data?: T;
  message?: string;
};
