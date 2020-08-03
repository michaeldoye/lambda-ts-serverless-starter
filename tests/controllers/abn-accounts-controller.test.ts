import 'reflect-metadata';
import chai from 'chai';
import sinon, { SinonStubbedInstance } from 'sinon';
import { MessageUtil } from '../../app/utils/message';
import { MyCoolService } from '../../app/service/my-cool.service';
import { MyCoolController } from '../../app/controller/my-cool.controller';
import { createError } from '../../app/utils/helpers';
import { StatusCode } from '../../app/utils/enums';

const expect = chai.expect;

describe('My Cool Controller', () => {
  let sut: MyCoolController;
  let myCoolService: SinonStubbedInstance<MyCoolService>;

  beforeEach(() => {
    myCoolService = sinon.createStubInstance(MyCoolService);
    sut = new MyCoolController(myCoolService as any);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Error Control Flow', () => {
    it('Should return error if something is wrong', async () => {
      const errorStubValue = MessageUtil.error(
        createError('100', { message: 'No something provided' }, StatusCode.badRequest),
      );

      const response = await sut.handleSomeCoolControlFlow({
        something: null,
      });

      expect(response.body).to.equal(errorStubValue.body);
      expect(myCoolService.getStuffFromApi.calledOnce).to.be.false;
    });

    it('Should return error if could not get something from API', async () => {
      const errorStubValue = MessageUtil.error(
        createError('100', { message: 'Could not get something' }, StatusCode.badRequest),
      );

      myCoolService.getStuffFromApi.resolves(null);
      const response = await sut.handleSomeCoolControlFlow({
        something: 'something',
      });

      expect(response.body).to.equal(errorStubValue.body);
      expect(myCoolService.getStuffFromApi.calledOnce).to.be.true;
    });
  });

  describe('Success Control Flow', () => {
    it('Should return success if something is right', async () => {
      const successStubValue = MessageUtil.success('success', { stuff: 'bar1' });

      myCoolService.getStuffFromApi.resolves({ args: { foo1: 'bar1', foo2: 'something else' } });
      const response = await sut.handleSomeCoolControlFlow({
        something: 'test-string',
      });

      expect(response.body).to.equal(successStubValue.body);
      expect(myCoolService.getStuffFromApi.calledOnce).to.be.true;
    });
  });
});
