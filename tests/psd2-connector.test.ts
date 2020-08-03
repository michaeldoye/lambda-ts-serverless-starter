import 'reflect-metadata';
import { expect } from 'chai';
import { psd2GetAuthUrl } from '../app/handler';
import lambdaTester from 'lambda-tester';

describe('Auth Code Rabo', () => {
  it('getAuthCode', async () => {
    return await lambdaTester(psd2GetAuthUrl)
      .event({ queryStringParameters: { bankId: 'ING' }, body: {} })
      .expectResult((result: any) => {
        expect(result.statusCode).to.equal(200);
      });
  });
});
