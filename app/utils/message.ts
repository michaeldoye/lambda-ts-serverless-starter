import { ErrorModel } from '../model/shared/error.model';
import { successModel, unknownError } from './helpers';

class Result {
  private readonly statusCode: number;
  private readonly code: string;
  private readonly message: string;
  private readonly data?: any;

  constructor(errorModel: ErrorModel, data?: any) {
    this.statusCode = errorModel.statusCode;
    this.code = errorModel.code;
    this.message = errorModel.message;
    this.data = data;
  }

  /**
   * According to the API Gateway specs, the body content must be stringified
   */
  bodyToString() {
    return {
      statusCode: this.statusCode,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      },
      body: JSON.stringify({
        code: this.code,
        message: this.message,
        data: this.data,
      }),
    };
  }
}

export class MessageUtil {
  static success(message, data?: any) {
    const result = new Result(successModel(message ? message : 'Success'), data);

    return result.bodyToString();
  }

  static error(errorModel: ErrorModel = unknownError()) {
    const result = new Result(errorModel);

    return result.bodyToString();
  }
}
