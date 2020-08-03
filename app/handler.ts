import 'reflect-metadata';
import { Handler } from 'aws-lambda';
import { MyCoolController } from './controller/my-cool.controller';
import { MyCoolAWSEvent } from './model/shared/aws-event.model';
import { MessageUtil } from './utils/message';
import { container } from 'tsyringe';
import { unknownError } from './utils/helpers';

const myCoolController = container.resolve<MyCoolController>(MyCoolController);

/**
 * ### getSomeStuffFromAPI
 *
 * Describe your lambda here (you can use markdown to render code snippets in docs (npm run docs))
 *
 * @param event  AWS event object.
 *
 */
export const getSomeStuffFromAPI: Handler = (event: MyCoolAWSEvent) => {
  if (event) {
    return myCoolController.handleSomeCoolControlFlow(event);
  }

  return Promise.resolve(MessageUtil.error(unknownError()));
};
