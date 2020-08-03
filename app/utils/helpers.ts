import { StatusCode } from './enums';
import { ErrorModel } from '../model/shared/error.model';

export const parseResponse = (response: string) => {
  if (response) {
    return JSON.parse(response);
  }
  return { error: 'Could not parse string' };
};

export const createError = (code, error, statusCode = StatusCode.badRequest) => {
  return {
    code,
    statusCode,
    message: error.message,
  };
};

export const successModel = (message): ErrorModel => {
  return {
    message,
    code: '0',
    statusCode: StatusCode.success,
  };
};

export const unknownError = (): ErrorModel => {
  return {
    code: '100',
    message: 'Something went wrong',
    statusCode: StatusCode.badRequest,
  };
};
