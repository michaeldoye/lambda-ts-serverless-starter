import 'reflect-metadata';
import sinon, { SinonStubbedInstance } from 'sinon';
import { AbnTransactionsController } from '../../../app/controller/abn/abn-transactions.controller';
import { SharedHelpers } from '../../../app/utils/helpers';
import { AbnTokensService } from '../../../app/service/abn/abn-tokens.service';
import { DynamoService } from '../../../app/service/shared/dynamo.service';
import { MessageUtil } from '../../../app/utils/message';
import chai from 'chai';
import { notAuthorizedError } from '../../../app/model/shared/error.model';
import { AbnTransactionsService } from '../../../app/service/abn/abn-transactions.service';
import {
  expiredDbTokenResponse,
  invalidDbTokenResponse,
  validDbTokenResponse,
  validTransactionsResponse,
} from '../shared/controllers.mock';

const expect = chai.expect;

describe('ABN Transactions Controller', () => {
  let sut: AbnTransactionsController;
  let helperService: SinonStubbedInstance<SharedHelpers>;
  let tokenService: SinonStubbedInstance<AbnTokensService>;
  let transactionsService: SinonStubbedInstance<AbnTransactionsService>;
  let dbService: SinonStubbedInstance<DynamoService>;

  beforeEach(() => {
    dbService = sinon.createStubInstance(DynamoService);
    tokenService = sinon.createStubInstance(AbnTokensService);
    helperService = sinon.createStubInstance(SharedHelpers);
    transactionsService = sinon.createStubInstance(AbnTransactionsService);
    sut = new AbnTransactionsController(
      dbService,
      transactionsService as any,
      tokenService as any,
      helperService as any
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should return error if no tokens in db', async () => {
    const successStubValue = MessageUtil.error(notAuthorizedError());

    dbService.getTokensFromDB.resolves([invalidDbTokenResponse]);

    const response = await sut.getTransactions('id', 'user', {});

    expect(response.body).to.equal(successStubValue.body);
    expect(dbService.getTokensFromDB.calledOnce).to.be.true;
  });

  it('Should return error if no tokens is present in proxy mode', async () => {
    const successStubValue = MessageUtil.error(notAuthorizedError());

    const response = await sut.getTransactions('id', 'user', {}, true);

    expect(response.body).to.equal(successStubValue.body);
    expect(dbService.getTokensFromDB.calledOnce).to.be.false;
  });

  it('Should call refresh token if expiration date is passed', async () => {
    dbService.getTokensFromDB.resolves([expiredDbTokenResponse]);

    helperService.getDateWithTimezoneOffset.returns(new Date());

    helperService.handleRefreshTokens.resolves([validDbTokenResponse]);

    transactionsService.getAllTransactions.resolves([validTransactionsResponse]);

    helperService.isResponseError.returns(true);

    const response = await sut.getTransactions('id', 'user', {});

    expect(helperService.handleRefreshTokens.calledOnce).to.be.true;
    expect(response.body).to.not.be.empty;
  });

  it('Should NOT call refresh token if proxy is true', async () => {
    transactionsService.getAllTransactions.resolves([validTransactionsResponse]);

    const response = await sut.getTransactions('id', 'user', { accessToken: 'token' }, true);

    expect(helperService.handleRefreshTokens.calledOnce).to.be.false;
    expect(response.body).to.not.be.empty;
  });

  it('Should return success if proxy flow is valid', async () => {
    const successStubValue = MessageUtil.success('success', [validTransactionsResponse]);

    transactionsService.getAllTransactions.resolves([validTransactionsResponse]);

    const response = await sut.getTransactions('id', 'user', { accessToken: 'token' }, true);

    expect(response.body).to.equal(successStubValue.body);
  });

  it('Should return success if controller flow is valid and proxy is false', async () => {
    const successStubValue = MessageUtil.success('success', [validTransactionsResponse]);

    dbService.getTokensFromDB.resolves([validDbTokenResponse]);

    dbService.createEntry.resolves({});

    transactionsService.getAllTransactions.resolves([validTransactionsResponse]);

    const response = await sut.getTransactions('id', 'user', {});

    expect(response.body).to.equal(successStubValue.body);
  });
});
