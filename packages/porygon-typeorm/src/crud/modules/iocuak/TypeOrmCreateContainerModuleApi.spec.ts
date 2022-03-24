jest.mock('@cuaklabs/iocuak');

import {
  ContainerApi,
  inject,
  injectable,
  TaskScopeApi,
} from '@cuaklabs/iocuak';
import { CrudModuleType, ModuleTypeToSymbolMap } from '@cuaklabs/porygon';

import { InsertTypeOrmAdapter } from '../../adapter/typeorm/InsertTypeOrmAdapter';
import { CrudTypeOrmModuleType } from '../../models/domain/CrudTypeOrmModuleType';
import { TypeOrmCreateContainerModuleApi } from './TypeOrmCreateContainerModuleApi';

interface ModelTest {
  foo: string;
}

interface QueryTest {
  bar: string;
}

// eslint-disable-next-line @typescript-eslint/ban-types
function expectClassExtending(superclass: Function): Function {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return expect.objectContaining<Partial<Function>>({
    // eslint-disable-next-line @typescript-eslint/ban-types
    prototype: expect.any(superclass) as Function,
    // eslint-disable-next-line @typescript-eslint/ban-types
  }) as Function;
}

describe(TypeOrmCreateContainerModuleApi.name, () => {
  let crudModuleTypeToSymbolMap: ModuleTypeToSymbolMap<CrudModuleType>;
  let crudTypeOrmModuleTypeToSymbolMap: ModuleTypeToSymbolMap<CrudTypeOrmModuleType>;
  let typeOrmCreateContainerModuleApi: TypeOrmCreateContainerModuleApi<
    ModelTest,
    ModelTest,
    QueryTest
  >;

  beforeAll(() => {
    crudModuleTypeToSymbolMap = Object.freeze({
      [CrudModuleType.createEntityAdapter]: Symbol(),
      [CrudModuleType.createEntityInteractor]: Symbol(),
      [CrudModuleType.deleteEntityAdapter]: Symbol(),
      [CrudModuleType.deleteEntityInteractor]: Symbol(),
      [CrudModuleType.readEntityAdapter]: Symbol(),
      [CrudModuleType.readManyEntityInteractor]: Symbol(),
      [CrudModuleType.readOneEntityInteractor]: Symbol(),
      [CrudModuleType.updateEntityAdapter]: Symbol(),
      [CrudModuleType.updateEntityInteractor]: Symbol(),
    });

    crudTypeOrmModuleTypeToSymbolMap = Object.freeze({
      [CrudTypeOrmModuleType.findQueryToFindQueryTypeOrmConverter]: Symbol(),
      [CrudTypeOrmModuleType.insertQueryToSetTypeOrmQueryConverter]: Symbol(),
      [CrudTypeOrmModuleType.modelDbToModelConverter]: Symbol(),
      [CrudTypeOrmModuleType.repository]: Symbol(),
      [CrudTypeOrmModuleType.updateQueryToFindQueryTypeOrmConverter]: Symbol(),
      [CrudTypeOrmModuleType.updateQueryToSetQueryTypeOrmConverter]: Symbol(),
    });

    typeOrmCreateContainerModuleApi = new TypeOrmCreateContainerModuleApi(
      crudModuleTypeToSymbolMap,
      crudTypeOrmModuleTypeToSymbolMap,
    );
  });

  describe('.load()', () => {
    let containerApiMock: jest.Mocked<ContainerApi>;

    beforeAll(() => {
      containerApiMock = {
        bind: jest.fn(),
      } as Partial<jest.Mocked<ContainerApi>> as jest.Mocked<ContainerApi>;
    });

    describe('when called', () => {
      let injectDecoratorMock: jest.Mock<
        void,
        // eslint-disable-next-line @typescript-eslint/ban-types
        [Object, string | symbol, number | void]
      >;
      // eslint-disable-next-line @typescript-eslint/ban-types
      let injectableDecoratorMock: jest.Mock<void, [Function]>;

      beforeAll(() => {
        injectDecoratorMock = jest.fn<
          void,
          // eslint-disable-next-line @typescript-eslint/ban-types
          [Object, string | symbol, number | void]
        >();

        (inject as jest.Mock<PropertyDecorator & ParameterDecorator>)
          .mockReturnValueOnce(injectDecoratorMock)
          .mockReturnValueOnce(injectDecoratorMock)
          .mockReturnValueOnce(injectDecoratorMock);

        // eslint-disable-next-line @typescript-eslint/ban-types
        injectableDecoratorMock = jest.fn<void, [Function]>();

        (injectable as jest.Mock<ClassDecorator>).mockReturnValueOnce(
          injectableDecoratorMock,
        );

        typeOrmCreateContainerModuleApi.load(containerApiMock);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call injectable()', () => {
        expect(injectable).toHaveBeenCalledTimes(1);
        expect(injectableDecoratorMock).toHaveBeenCalledTimes(1);

        expect(injectable).toHaveBeenCalledWith({
          id: crudModuleTypeToSymbolMap.createEntityAdapter,
          scope: TaskScopeApi.singleton,
        });

        expect(injectableDecoratorMock).toHaveBeenCalledWith(
          expectClassExtending(InsertTypeOrmAdapter),
        );
      });

      it('should call inject()', () => {
        expect(inject).toHaveBeenCalledTimes(3);
        expect(injectDecoratorMock).toHaveBeenCalledTimes(3);
      });

      it('should call inject() on InsertTypeOrmAdapter in the first call', () => {
        expect(inject).toHaveBeenNthCalledWith(
          1,
          crudTypeOrmModuleTypeToSymbolMap[CrudTypeOrmModuleType.repository],
        );

        expect(injectDecoratorMock).toHaveBeenNthCalledWith(
          1,
          expectClassExtending(InsertTypeOrmAdapter),
          undefined,
          0,
        );
      });

      it('should call inject() on InsertTypeOrmAdapter in the second call', () => {
        expect(inject).toHaveBeenNthCalledWith(
          2,
          crudTypeOrmModuleTypeToSymbolMap[
            CrudTypeOrmModuleType.modelDbToModelConverter
          ],
        );

        expect(injectDecoratorMock).toHaveBeenNthCalledWith(
          2,
          expectClassExtending(InsertTypeOrmAdapter),
          undefined,
          1,
        );
      });

      it('should call inject() on InsertTypeOrmAdapter in the third call', () => {
        expect(inject).toHaveBeenNthCalledWith(
          3,
          crudTypeOrmModuleTypeToSymbolMap[
            CrudTypeOrmModuleType.insertQueryToSetTypeOrmQueryConverter
          ],
        );

        expect(injectDecoratorMock).toHaveBeenNthCalledWith(
          3,
          expectClassExtending(InsertTypeOrmAdapter),
          undefined,
          2,
        );
      });

      it('should call containerApi.bind()', () => {
        expect(containerApiMock.bind).toHaveBeenCalledTimes(1);
        expect(containerApiMock.bind).toHaveBeenCalledWith(
          expectClassExtending(InsertTypeOrmAdapter),
        );
      });
    });
  });
});
