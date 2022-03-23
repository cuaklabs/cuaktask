import 'reflect-metadata';

import { ContainerApi, injectable } from '@cuaklabs/iocuak';

import { CrudModuleType } from '../../models/domain/CrudModuleType';
import { ModuleTypeToSymbolMap } from '../../models/domain/ModuleTypeToSymbolMap';
import { DeleteEntityPort } from '../../port/application/DeleteEntityPort';
import { DeleteEntityInteractor } from '../domain/DeleteEntityInteractor';
import { DomainDeleteContainerModuleApi } from './DomainDeleteContainerModuleApi';

interface QueryTest {
  bar: string;
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
    describe('having a containerApi with no delete adapter bound', () => {
      let containerApi: ContainerApi;

      beforeAll(() => {
        containerApi = ContainerApi.build();
      });

      describe('when called', () => {
        beforeAll(() => {
          domainDeleteContainerModuleApi.load(containerApi);
        });

        describe('when containerApi.get is called with delete entity interactor symbol', () => {
          let result: unknown;

          beforeAll(() => {
            try {
              containerApi.get(
                crudModuleTypeToSymbolMap[
                  CrudModuleType.deleteEntityInteractor
                ],
              );
            } catch (error: unknown) {
              result = error;
            }
          });

          it('should throw an Error', () => {
            expect(result).toBeInstanceOf(Error);
            expect(result).toStrictEqual(
              expect.objectContaining<Partial<Error>>({
                message: expect.stringContaining(
                  'No bindings found for type Symbol()',
                ) as string,
              }),
            );
          });
        });
      });
    });

    describe('having a containerApi with delete adapter bound', () => {
      class DeleteAdapterMock implements DeleteEntityPort<QueryTest> {
        public readonly deleteMock: jest.Mock<Promise<void>, [QueryTest]>;

        constructor() {
          this.deleteMock = jest.fn<Promise<void>, [QueryTest]>();
        }

        public async delete(query: QueryTest): Promise<void> {
          return this.deleteMock(query);
        }
      }

      let containerApi: ContainerApi;

      beforeAll(() => {
        injectable({
          id: crudModuleTypeToSymbolMap[CrudModuleType.deleteEntityAdapter],
        })(DeleteAdapterMock);

        containerApi = ContainerApi.build();

        containerApi.bind(DeleteAdapterMock);
      });

      describe('when called', () => {
        beforeAll(() => {
          domainDeleteContainerModuleApi.load(containerApi);
        });

        describe('when containerApi.get is called with delete entity interactor symbol', () => {
          let result: unknown;

          beforeAll(() => {
            result = containerApi.get(
              crudModuleTypeToSymbolMap[CrudModuleType.deleteEntityInteractor],
            );
          });

          it('should return a DeleteEntityInteractor', () => {
            expect(result).toBeInstanceOf(DeleteEntityInteractor);
          });
        });
      });
    });
  });
});
