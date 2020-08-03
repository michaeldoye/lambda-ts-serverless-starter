import 'reflect-metadata';
import chai from 'chai';
import sinon, { SinonStubbedInstance } from 'sinon';
import { AbnAccountsController } from '../../../app/controller/abn/abn-accounts.controller';
import { DynamoService } from '../../../app/service/shared/dynamo.service';
import { MessageUtil } from '../../../app/utils/message';
import { MyCoolService } from '../../../app/service/my-cool.service';
import { AbnTokensService } from '../../../app/service/abn/abn-tokens.service';
import { SharedHelpers } from '../../../app/utils/helpers';
import {
  createError,
  ErrorMessages,
  notAuthorizedError,
} from '../../../app/model/shared/error.model';
import {
  expiredDbTokenResponse,
  invalidDbTokenResponse,
  validDbTokenResponse,
} from '../shared/controllers.mock';

const expect = chai.expect;

describe('ABN Accounts Controller', () => {
  let sut: AbnAccountsController;
  let accountService: SinonStubbedInstance<MyCoolService>;
  let tokenService: SinonStubbedInstance<AbnTokensService>;
  let dbService: SinonStubbedInstance<DynamoService>;
  let helperService: SinonStubbedInstance<SharedHelpers>;

  beforeEach(() => {
    dbService = sinon.createStubInstance(DynamoService);
    tokenService = sinon.createStubInstance(AbnTokensService);
    accountService = sinon.createStubInstance(MyCoolService);
    helperService = sinon.createStubInstance(SharedHelpers);
    sut = new AbnAccountsController(
      dbService,
      accountService as any,
      tokenService as any,
      helperService as any
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should throw error if invalid token response', async () => {
    const errorStubValue = MessageUtil.error(notAuthorizedError());

    dbService.getTokensFromDB.resolves([invalidDbTokenResponse]);
    const response = await sut.getAccountsByIdAndSaveToDb(
      {
        bankId: 'test',
        accountId: 'test',
        accessToken: null,
      },
      'test'
    );

    expect(response.body).to.equal(errorStubValue.body);
    expect(dbService.getTokensFromDB.calledOnce).to.be.true;
  });

  it('Should throw error if invalid account response', async () => {
    const errorStubValue = MessageUtil.error(
      createError('100', { message: ErrorMessages.accountError })
    );

    dbService.getTokensFromDB.resolves([
      {
        bankId: 'ABN',
        accessToken: 'token',
        refreshToken: 'refresh',
        expirationDate: new Date(new Date().getTime() + 1000000 * 60 * 60).toISOString(),
        userId: 'userId',
        id: 'id',
        accountId: 'accountId',
      },
    ]);

    accountService.getAccounts.resolves({
      error: 'some error',
      description: 'error desc',
    });

    helperService.isResponseError.returns(true);

    const response = await sut.getAccountsByIdAndSaveToDb(
      {
        bankId: 'test',
        accountId: 'test',
        accessToken: null,
      },
      'test'
    );

    expect(response.body).to.equal(errorStubValue.body);
    expect(dbService.getTokensFromDB.calledOnce).to.be.true;
    expect(helperService.isResponseError.calledOnce).to.be.true;
    expect(accountService.getAccounts.calledOnce).to.be.true;
  });

  it('Should call refresh token if expiration date is passed', async () => {
    const errorStubValue = MessageUtil.error(
      createError('100', { message: ErrorMessages.accountError })
    );

    dbService.getTokensFromDB.resolves([expiredDbTokenResponse]);

    helperService.getDateWithTimezoneOffset.returns(new Date());

    helperService.handleRefreshTokens.resolves([validDbTokenResponse]);

    accountService.getAccounts.resolves({
      error: 'some error',
      description: 'error desc',
    });

    helperService.isResponseError.returns(true);

    const response = await sut.getAccountsByIdAndSaveToDb(
      {
        bankId: 'test',
        accountId: 'test',
        accessToken: null,
      },
      'test'
    );

    expect(response.body).to.equal(errorStubValue.body);
    expect(dbService.getTokensFromDB.calledOnce).to.be.true;
    expect(helperService.handleRefreshTokens.calledOnce).to.be.true;
    expect(helperService.isResponseError.calledOnce).to.be.true;
    expect(helperService.getDateWithTimezoneOffset.calledOnce).to.be.true;
    expect(accountService.getAccounts.calledOnce).to.be.true;
  });

  it('Should return error if cannot save account to DB', async () => {
    const errorStubValue = MessageUtil.error(
      createError('100', { message: ErrorMessages.databaseWriteError })
    );

    dbService.getTokensFromDB.resolves([
      {
        bankId: 'ABN',
        accessToken: 'token',
        refreshToken: 'refresh',
        expirationDate: new Date(new Date().getTime() + 1000000 * 60 * 60).toISOString(),
        userId: 'userId',
        id: 'id',
        accountId: 'accountId',
      },
    ]);

    accountService.getAccounts.resolves({
      accountNumber: 'iban',
      balanceType: 'test',
      amount: 1,
      currency: 'EUR',
    });

    dbService.saveAccount.resolves(null);

    const response = await sut.getAccountsByIdAndSaveToDb(
      {
        bankId: 'test',
        accountId: 'test',
        accessToken: null,
      },
      'test'
    );

    expect(response.body).to.equal(errorStubValue.body);
    expect(dbService.getTokensFromDB.calledOnce).to.be.true;
    expect(accountService.getAccounts.calledOnce).to.be.true;
    expect(dbService.saveAccount.calledOnce).to.be.true;
  });

  it('Should return success if accounts controller flow is valid', async () => {
    const successStubValue = MessageUtil.success('Account Saved');

    dbService.getTokensFromDB.resolves([
      {
        bankId: 'ABN',
        accessToken: 'token',
        refreshToken: 'refresh',
        expirationDate: new Date(new Date().getTime() + 1000000 * 60 * 60).toISOString(),
        userId: 'userId',
        id: 'id',
        accountId: 'accountId',
      },
    ]);

    accountService.getAccounts.resolves({
      accountNumber: 'iban',
      balanceType: 'test',
      amount: 1,
      currency: 'EUR',
    });

    dbService.saveAccount.resolves({});

    const response = await sut.getAccountsByIdAndSaveToDb(
      {
        bankId: 'test',
        accountId: 'test',
        accessToken: null,
      },
      'test'
    );

    expect(response.body).to.equal(successStubValue.body);
    expect(dbService.getTokensFromDB.calledOnce).to.be.true;
    expect(accountService.getAccounts.calledOnce).to.be.true;
    expect(dbService.saveAccount.calledOnce).to.be.true;
  });

  it('Should return account when isProxy true and accountId, bankId and accessToken is provided', async () => {
    const proxyResponseStub = MessageUtil.success('Success', {
      userId: null,
      iban: 'iban',
      amount: 1,
      bank: 'test',
      id: 'iban',
      name: 'test',
    });

    accountService.getAccounts.resolves({
      accountNumber: 'iban',
      balanceType: 'test',
      amount: 1,
      currency: 'EUR',
    });

    const isProxy = true;
    const response = await sut.getAccountsByIdAndSaveToDb(
      {
        bankId: 'test',
        accountId: 'test',
        accessToken: 'token',
      },
      'test',
      isProxy
    );

    expect(dbService.addTokensToDB.calledOnce).to.be.false;
    expect(accountService.getAccounts.calledOnce).to.be.true;
    expect(response.body).to.equal(proxyResponseStub.body);
  });

  it('Should return error if isProxy true AND invalid accessToken', async () => {
    const proxyResponseStub = MessageUtil.error(notAuthorizedError());
    const isProxy = true;

    const response = await sut.getAccountsByIdAndSaveToDb(
      {
        bankId: 'test',
        accountId: 'test',
        accessToken: null,
      },
      'test',
      isProxy
    );

    expect(dbService.addTokensToDB.calledOnce).to.be.false;
    expect(accountService.getAccounts.calledOnce).to.be.false;
    expect(response.body).to.equal(proxyResponseStub.body);
  });
});
