import { MessageUtil } from '../utils/message';
import { AwsEventModel } from '../model/shared/aws-event.model';
import { MyCoolService } from '../service/my-cool.service';
import { singleton } from 'tsyringe';
import { StatusCode } from '../utils/enums';
import { createError } from '../utils/helpers';

@singleton()
export class MyCoolController {
  constructor(public myCoolService: MyCoolService) {}

  async handleSomeCoolControlFlow(event: AwsEventModel) {
    try {
      console.log(event);

      const stuffFromApi = this.myCoolService.getStuffFromApi();

      return MessageUtil.success('success', { stuff: stuffFromApi });
    } catch (err) {
      console.log(err);

      return MessageUtil.error(
        createError('100', { message: 'Something went wrong' }, StatusCode.badRequest),
      );
    }
  }
}
