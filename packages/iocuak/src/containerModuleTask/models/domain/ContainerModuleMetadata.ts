import { ContainerModuleFactoryMetadata } from './ContainerModuleFactoryMetadata';

export type ContainerModuleMetadata<TArgs extends unknown[] = unknown[]> =
  ContainerModuleFactoryMetadata<TArgs>;
