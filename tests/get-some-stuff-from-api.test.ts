import 'reflect-metadata';
import { expect } from 'chai';
import { getSomeStuffFromAPI } from '../app/handler';
import lambdaTester from 'lambda-tester';

describe('Auth Code Rabo', () => {
  it('getAuthCode', async () => {
    return await lambdaTester(getSomeStuffFromAPI)
      .event({ something: 'blah' })
      .expectResult((result: any) => {
        expect(result.statusCode).to.equal(200);
      });
  });
});
