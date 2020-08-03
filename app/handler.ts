import 'reflect-metadata';
import { Handler } from 'aws-lambda';
import { MyCoolController } from './controller/my-cool.controller';
import { MyCoolAWSEvent } from './model/shared/aws-event.model';
import { MessageUtil } from './utils/message';
import { container } from 'tsyringe';
import { unknownError } from './utils/helpers';

const myCoolController = container.resolve<MyCoolController>(MyCoolController);

/**
 * ### GetAuthUrl
 *
 * Initiates the consent flow for the specified bank and
 * handles the initial connection to the bank, usually to request and authorisation code
 * which is used to begin the OAuth2.0 flow
 *
 * Saves those accounts to DynamoDB
 *
 * @param event  AWS event object. MUST contain a string representing the Bank ID
 *
 */
export const GetSomeStuffFromAPI: Handler = (event: MyCoolAWSEvent) => {
  if (event) {
    return myCoolController.handleSomeCoolControlFlow(event);
  }

  return Promise.resolve(MessageUtil.error(unknownError()));
};
