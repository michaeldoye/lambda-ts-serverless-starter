import { HttpsService } from './shared/https.service';
import { injectable } from 'tsyringe';
import { RequestOptions } from '../model/shared/https.model';
import { MethodTypesEnum } from '../utils/enums';

export interface IMyCoolService {
  getStuffFromApi(): Promise<FooResponse>;
}

interface FooResponse {
  args: Args;
}

interface Args {
  foo1: string;
  foo2: string;
}

@injectable()
export class MyCoolService extends HttpsService implements IMyCoolService {
  get requestOptions(): RequestOptions {
    return {
      path: '/get?foo1=bar1&foo2=bar2',
      hostname: 'postman-echo.com',
      method: MethodTypesEnum.GET,
      headers: {
        Accept: 'application/json',
      },
    };
  }

  async getStuffFromApi(): Promise<FooResponse> {
    return await this.executeRequest<FooResponse>(null, this.requestOptions);
  }
}
