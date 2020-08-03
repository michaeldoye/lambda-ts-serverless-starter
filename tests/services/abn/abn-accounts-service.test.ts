import chai from 'chai';
import sinon from 'sinon';
import { MyCoolService } from '../../../app/service/my-cool.service';
import { SharedHelpers } from '../../../app/utils/helpers';

const expect = chai.expect;

describe('ABN Accounts Service', () => {
  let accountsService: MyCoolService;

  beforeEach(() => {
    accountsService = new MyCoolService(new SharedHelpers());
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should get API key from Secret Manager', async () => {
    const stubValue = 'FAKE_ID';
    const stub = sinon.stub(accountsService, 'getApiKey').resolves(stubValue);
    const keyResponse = await accountsService.getApiKey();

    expect(stub.calledOnce).to.be.true;
    expect(keyResponse).to.equal(stubValue);
  });

  it('Should get Accounts', async () => {
    const accountsStubValue = {
      accountNumber: '',
      balanceType: '',
      amount: 1,
      currency: '',
    };
    const getAccountsStub = sinon.stub(accountsService, 'getAccounts').resolves(accountsStubValue);
    const accountsResponse = await accountsService.getAccounts('id', 'token');

    expect(getAccountsStub.calledOnce).to.be.true;
    expect(accountsResponse).to.equal(accountsStubValue);
  });

  it('Should get ConsentInfo', async () => {
    const stubValue = {
      iban: '',
      transactionId: '',
      scopes: '',
      valid: 1,
    };

    const stub = sinon.stub(accountsService, 'getConsentInfo').resolves(stubValue);
    const consentResponse = await accountsService.getConsentInfo('token');

    expect(stub.calledOnce).to.be.true;
    expect(consentResponse).to.equal(stubValue);
  });
});
