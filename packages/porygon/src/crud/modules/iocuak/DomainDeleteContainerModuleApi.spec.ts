jest.mock('@cuaklabs/iocuak');

import {
  ContainerApi,
  inject,
  injectable,
  TaskScopeApi,
} from '@cuaklabs/iocuak';

import { CrudModuleType } from '../../models/domain/CrudModuleType';
import { ModuleTypeToSymbolMap } from '../../models/domain/ModuleTypeToSymbolMap';
import { DeleteEntityInteractor } from '../domain/DeleteEntityInteractor';
import { DomainDeleteContainerModuleApi } from './DomainDeleteContainerModuleApi';

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

describe(DomainDeleteContainerModuleApi.name, () => {
  let crudModuleTypeToSymbolMap: ModuleTypeToSymbolMap<CrudModuleType>;
  let domainDeleteContainerModuleApi: DomainDeleteContainerModuleApi<QueryTest>;

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

    domainDeleteContainerModuleApi = new DomainDeleteContainerModuleApi(
      crudModuleTypeToSymbolMap,
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

        (
          inject as jest.Mock<PropertyDecorator & ParameterDecorator>
        ).mockReturnValueOnce(injectDecoratorMock);

        // eslint-disable-next-line @typescript-eslint/ban-types
        injectableDecoratorMock = jest.fn<void, [Function]>();

        (injectable as jest.Mock<ClassDecorator>).mockReturnValueOnce(
          injectableDecoratorMock,
        );

        domainDeleteContainerModuleApi.load(containerApiMock);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call injectable()', () => {
        expect(injectable).toHaveBeenCalledTimes(1);
        expect(injectableDecoratorMock).toHaveBeenCalledTimes(1);

        expect(injectable).toHaveBeenCalledWith({
          id: crudModuleTypeToSymbolMap.deleteEntityInteractor,
          scope: TaskScopeApi.singleton,
        });

        expect(injectableDecoratorMock).toHaveBeenCalledWith(
          expectClassExtending(DeleteEntityInteractor),
        );
      });

      it('should call inject()', () => {
        expect(inject).toHaveBeenCalledTimes(1);
        expect(injectDecoratorMock).toHaveBeenCalledTimes(1);

        expect(inject).toHaveBeenCalledWith(
          crudModuleTypeToSymbolMap[CrudModuleType.deleteEntityAdapter],
        );

        expect(injectDecoratorMock).toHaveBeenCalledWith(
          expectClassExtending(DeleteEntityInteractor),
          undefined,
          0,
        );
      });

      it('should call containerApi.bind()', () => {
        expect(containerApiMock.bind).toHaveBeenCalledTimes(1);
        expect(containerApiMock.bind).toHaveBeenCalledWith(
          expectClassExtending(DeleteEntityInteractor),
        );
      });
    });
  });
});
