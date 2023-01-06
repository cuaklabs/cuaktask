import { isPromiseLike } from '@cuaklabs/iocuak-common';
import { ClassElementMetadata } from '@cuaklabs/iocuak-models';

import { ContainerModule } from '../../containerModule/models/ContainerModule';
import { ContainerModuleFactoryMetadata } from '../../containerModuleMetadata/models/ContainerModuleFactoryMetadata';
import { CreateInstanceTaskContext } from '../models/CreateInstanceTaskContext';
import { getDependency } from './getDependency';

export function loadFromContainerModuleFactoryMetadata(
  metadata: ContainerModuleFactoryMetadata,
  context: CreateInstanceTaskContext,
): void | Promise<void> {
  const instances: unknown[] = metadata.injects.map(
    (inject: ClassElementMetadata) =>
      getDependency(inject, {
        ...context,
        servicesInstantiatedSet: new Set(),
      }),
  );

  const containerModule: ContainerModule | Promise<ContainerModule> =
    metadata.factory(...instances);

  if (isPromiseLike(containerModule)) {
    return loadModuleAsync(containerModule, context);
  } else {
    containerModule.load(context.services.bindingService);
  }
}

async function loadModuleAsync(
  containerModulePromise: Promise<ContainerModule>,
  context: CreateInstanceTaskContext,
): Promise<void> {
  const containerModule: ContainerModule = await containerModulePromise;

  containerModule.load(context.services.bindingService);
}
