import {
  ContainerApiService,
  ContainerModuleApi,
  inject,
  injectable,
  Newable,
  ServiceId,
  TaskScope,
} from '@cuaklabs/iocuak';

import { InteractorAsync } from '../../../common/modules/domain/InteractorAsync';
import { CrudModuleType } from '../../models/domain/CrudModuleType';
import { ModuleTypeToSymbolMap } from '../../models/domain/ModuleTypeToSymbolMap';
import { FindEntityPort } from '../../port/application/FindEntityPort';
import { ReadManyEntityInteractor } from '../domain/ReadManyEntityInteractor';
import { ReadOneEntityInteractor } from '../domain/ReadOneEntityInteractor';

export class DomainReadContainerModuleApi<TModel, TQuery>
  implements ContainerModuleApi
{
  readonly #crudModuleTypeToSymbolMap: ModuleTypeToSymbolMap<CrudModuleType>;
  readonly #readManyEntityInteractorType: Newable<
    InteractorAsync<TQuery, TModel[]>,
    [FindEntityPort<TModel, TQuery>]
  >;
  readonly #readOneEntityInteractorType: Newable<
    InteractorAsync<TQuery, TModel | undefined>,
    [FindEntityPort<TModel, TQuery>]
  >;

  constructor(
    crudModuleTypeToSymbolMap: ModuleTypeToSymbolMap<CrudModuleType>,
  ) {
    this.#crudModuleTypeToSymbolMap = crudModuleTypeToSymbolMap;
    this.#readManyEntityInteractorType = class extends ReadManyEntityInteractor<
      TModel,
      TQuery
    > {};
    this.#readOneEntityInteractorType = class extends ReadOneEntityInteractor<
      TModel,
      TQuery
    > {};
  }

  public load(container: ContainerApiService): void {
    this.#loadReadOneEntityInteractor(container);
    this.#loadReadManyEntityInteractor(container);
  }

  #loadReadOneEntityInteractor(container: ContainerApiService): void {
    const readOneEntityInteractorServiceId: ServiceId =
      this.#crudModuleTypeToSymbolMap[CrudModuleType.readOneEntityInteractor];

    injectable({
      id: readOneEntityInteractorServiceId,
      scope: TaskScope.singleton,
    })(this.#readOneEntityInteractorType);

    inject(CrudModuleType.readEntityAdapter)(
      this.#readOneEntityInteractorType,
      undefined as unknown as string | symbol,
      0,
    );

    container.bind(this.#readOneEntityInteractorType);
  }

  #loadReadManyEntityInteractor(container: ContainerApiService): void {
    const readManyEntityInteractorServiceId: ServiceId =
      this.#crudModuleTypeToSymbolMap[CrudModuleType.readManyEntityInteractor];

    injectable({
      id: readManyEntityInteractorServiceId,
      scope: TaskScope.singleton,
    })(this.#readManyEntityInteractorType);

    inject(CrudModuleType.readEntityAdapter)(
      this.#readManyEntityInteractorType,
      undefined as unknown as string | symbol,
      0,
    );

    container.bind(this.#readManyEntityInteractorType);
  }
}
