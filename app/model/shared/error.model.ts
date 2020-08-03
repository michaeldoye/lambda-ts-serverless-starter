import { StatusCode } from '../../utils/enums';

export interface ErrorModel {
  code: string;
  message: string;
  statusCode: StatusCode;
}
