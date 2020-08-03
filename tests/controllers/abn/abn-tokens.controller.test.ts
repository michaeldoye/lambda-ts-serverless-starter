import 'reflect-metadata';
import chai from 'chai';
import sinon, { SinonStubbedInstance } from 'sinon';
import { MyCoolController } from '../../../app/controller/my-cool.controller';
import { DynamoService } from '../../../app/service/shared/dynamo.service';
import { MyCoolService } from '../../../app/service/my-cool.service';
import { AbnTokensService } from '../../../app/service/abn/abn-tokens.service';
import { MessageUtil } from '../../../app/utils/message';
import {
  createError,
  ErrorMessages,
  notAuthorizedError,
} from '../../../app/model/shared/error.model';
import {
  ExchangeTokenEventBody,
  LambdaResponseModel,
} from '../../../app/model/shared/aws-event.model';
const expect = chai.expect;

describe('ABN Tokens Controller', () => {
  let sut: MyCoolController;
  let accountService: SinonStubbedInstance<MyCoolService>;
  let tokenService: SinonStubbedInstance<AbnTokensService>;
  let dbServiceStub: SinonStubbedInstance<DynamoService>;

  beforeEach(() => {
    dbServiceStub = sinon.createStubInstance(DynamoService);
    tokenService = sinon.createStubInstance(AbnTokensService);
    accountService = sinon.createStubInstance(MyCoolService);
    sut = new MyCoolController(dbServiceStub, accountService as any, tokenService as any);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getAuthUrl', () => {
    let url: LambdaResponseModel;

    beforeEach(async () => {
      url = await sut.getAuthUrl();
    });

    it('Should return ABN auth url', async () => {
      expect(url.body).not.be.empty;
    });

    it('Should return ABN auth url with scope', async () => {
      const expectedScope = 'scope=psd2';

      expect(url.body).contains(expectedScope);
    });

    it('Should return ABN auth url with client id', async () => {
      const expectedClientId = 'client_id=';

      expect(url.body).contains(expectedClientId);
    });

    it('Should return ABN auth url with localhost as redirect url', async () => {
      const expectedRedirectUrl = 'redirect_uri=https://localhost/auth';

      expect(url.body).contains(expectedRedirectUrl);
    });
  });

  describe('getExchangeTokens', () => {
    let AWSEventRequestBodyStub: ExchangeTokenEventBody;

    beforeEach(() => {
      AWSEventRequestBodyStub = {
        bankId: 'someid',
        code: 'somecode',
      };
    });

    it('Should return error if token response invalid', async () => {
      const exchangeTokensResponseStub = MessageUtil.error(notAuthorizedError());

      tokenService.getExchangeTokens.returns(
        Promise.resolve({
          access_token: null,
          refresh_token: null,
          token_type: null,
          expires_in: 0,
        })
      );
      const tokensResponse = await sut.exchangeTokens(AWSEventRequestBodyStub, 'userid');

      expect(tokensResponse.body).to.equal(exchangeTokensResponseStub.body);
    });

    it('Should return error if consent response invalid', async () => {
      const consentInfoResponseStub = MessageUtil.error(
        createError('100', { message: ErrorMessages.invalidConsent })
      );

      tokenService.getExchangeTokens.resolves({
        access_token: 'access',
        refresh_token: 'refresh',
        token_type: 'Bearer',
        expires_in: 11111,
      });
      accountService.getConsentInfo.resolves({
        iban: null,
        transactionId: '',
        scopes: '',
      });
      const tokensResponse = await sut.exchangeTokens(AWSEventRequestBodyStub, 'userid');

      expect(tokenService.getExchangeTokens.calledOnce).to.be.true;
      expect(accountService.getConsentInfo.calledOnce).to.be.true;
      expect(tokensResponse.body).to.equal(consentInfoResponseStub.body);
    });

    it('Should return error if tokens NOT added', async () => {
      const consentInfoResponseStub = MessageUtil.error(
        createError('100', { message: ErrorMessages.databaseWriteError })
      );

      tokenService.getExchangeTokens.resolves({
        access_token: 'access',
        refresh_token: 'refresh',
        token_type: 'Bearer',
        expires_in: 11111,
      });
      accountService.getConsentInfo.resolves({
        iban: 'iban',
        transactionId: '',
        scopes: '',
      });
      dbServiceStub.addTokensToDB.resolves(null);
      const tokensResponse = await sut.exchangeTokens(AWSEventRequestBodyStub, 'userid');

      expect(tokenService.getExchangeTokens.calledOnce).to.be.true;
      expect(accountService.getConsentInfo.calledOnce).to.be.true;
      expect(dbServiceStub.addTokensToDB.calledOnce).to.be.true;
      expect(tokensResponse.body).to.equal(consentInfoResponseStub.body);
    });

    it('Should return success if tokens controller flow is valid', async () => {
      const consentInfoResponseStub = MessageUtil.success('success', [
        { iban: 'iban', id: 'iban' },
      ]);

      tokenService.getExchangeTokens.resolves({
        access_token: 'access',
        refresh_token: 'refresh',
        token_type: 'Bearer',
        expires_in: 11111,
      });
      accountService.getConsentInfo.resolves({
        iban: 'iban',
        transactionId: '',
        scopes: '',
      });
      dbServiceStub.addTokensToDB.resolves({});
      const tokensResponse = await sut.exchangeTokens(AWSEventRequestBodyStub, 'userid');

      expect(tokenService.getExchangeTokens.calledOnce).to.be.true;
      expect(accountService.getConsentInfo.calledOnce).to.be.true;
      expect(dbServiceStub.addTokensToDB.calledOnce).to.be.true;
      expect(tokensResponse.body).to.equal(consentInfoResponseStub.body);
    });

    it('Should return tokens if isProxy true', async () => {
      const proxyResponseStub = MessageUtil.success('success', [
        {
          accessToken: 'token',
          refreshToken: 'refresh',
          accountId: 'iban',
          scopes: 'scopes',
        },
      ]);

      tokenService.getExchangeTokens.resolves({
        access_token: 'token',
        refresh_token: 'refresh',
        token_type: 'Bearer',
        expires_in: 11111,
      });
      accountService.getConsentInfo.resolves({
        iban: 'iban',
        transactionId: null,
        scopes: 'scopes',
      });
      const isProxy = true;
      const tokensResponse = await sut.exchangeTokens(AWSEventRequestBodyStub, 'userid', isProxy);

      expect(dbServiceStub.addTokensToDB.calledOnce).to.be.false;
      expect(tokenService.getExchangeTokens.calledOnce).to.be.true;
      expect(accountService.getConsentInfo.calledOnce).to.be.true;
      expect(tokensResponse.body).to.equal(proxyResponseStub.body);
    });
  });
});
