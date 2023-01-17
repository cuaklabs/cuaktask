import { isPromiseLike } from '@cuaklabs/iocuak-common';

import { ContainerModuleMetadata } from '../models/ContainerModuleMetadata';
import { LoadModuleMetadataTaskContext } from '../models/LoadModuleMetadataTaskContext';
import { loadContainerModuleElement } from './loadContainerModuleElement';
import { loadContainerModuleElementAsync } from './loadContainerModuleElementAsync';

export function loadContainerModuleMetadata(
  containerModuleMetadata: ContainerModuleMetadata,
  context: LoadModuleMetadataTaskContext,
): void | Promise<void> {
  const loadModuleDependenciesResult: void | Promise<void> =
    loadContainerModuleDependencies(containerModuleMetadata, context);

  let loadContainerModuleResult: void | Promise<void>;

  if (isPromiseLike(loadModuleDependenciesResult)) {
    loadContainerModuleResult = loadContainerModuleElementAsync(
      containerModuleMetadata,
      context,
      loadModuleDependenciesResult,
    );
  } else {
    loadContainerModuleResult = loadContainerModuleElement(
      containerModuleMetadata,
      context,
    );
  }

  return loadContainerModuleResult;
}

function loadContainerModuleDependencies(
  containerModuleMetadata: ContainerModuleMetadata,
  context: LoadModuleMetadataTaskContext,
): void | Promise<void> {
  const asyncResults: Promise<void>[] = [];

  for (const containerModuleMetadataDependency of containerModuleMetadata.imports) {
    const loadContainerModuleResult: void | Promise<void> =
      loadContainerModuleMetadata(containerModuleMetadataDependency, context);

    if (isPromiseLike(loadContainerModuleResult)) {
      asyncResults.push(loadContainerModuleResult);
    }
  }

  if (asyncResults.length !== 0) {
    return toVoidPromise(Promise.all(asyncResults));
  }
}

async function toVoidPromise(input: Promise<unknown>): Promise<void> {
  await input;
}