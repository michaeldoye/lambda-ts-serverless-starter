import 'reflect-metadata';
import { expect } from 'chai';
import { getSomeStuffFromAPI } from '../app/handler';
import lambdaTester from 'lambda-tester';

describe('My Cool Lambda Function', () => {
  it('Should get some stuff from an API', async () => {
    return await lambdaTester(getSomeStuffFromAPI)
      .event({ something: 'blah' })
      .expectResult((result: any) => {
        expect(result.statusCode).to.equal(200);
      });
  });
});
