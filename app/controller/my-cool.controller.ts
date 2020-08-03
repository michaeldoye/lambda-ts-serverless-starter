import { MessageUtil } from '../utils/message';
import { MyCoolAWSEvent } from '../model/shared/aws-event.model';
import { MyCoolService } from '../service/my-cool.service';
import { singleton } from 'tsyringe';
import { StatusCode } from '../utils/enums';
import { createError } from '../utils/helpers';

@singleton()
export class MyCoolController {
  constructor(public myCoolService: MyCoolService) {}

  async handleSomeCoolControlFlow(event: MyCoolAWSEvent) {
    try {
      if (!event || (event && !event.something)) {
        return MessageUtil.error(
          createError('100', { message: 'No something provided' }, StatusCode.badRequest),
        );
      }

      const stuffFromApi = await this.myCoolService.getStuffFromApi();

      if (!stuffFromApi) {
        return MessageUtil.error(
          createError('100', { message: 'Could not get something' }, StatusCode.serverError),
        );
      }

      return MessageUtil.success('success', { stuff: stuffFromApi.args.foo1 });
    } catch (err) {
      console.log(err);

      return MessageUtil.error(
        createError('100', { message: 'Something went wrong' }, StatusCode.serverError),
      );
    }
  }
}
