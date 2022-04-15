import * as cuaktask from '@cuaklabs/cuaktask';

import { ContainerModuleMetadataApiMocks } from '../mocks/models/api/ContainerModuleMetadataApiMocks';
import { ContainerModuleCreateInstancesTaskKindMocks } from '../mocks/models/domain/ContainerModuleCreateInstancesTaskKindMocks';
import { ContainerModuleLoadFromMetadataTaskKindMocks } from '../mocks/models/domain/ContainerModuleLoadFromMetadataTaskKindMocks';
import { ContainerModuleMetadataApi } from '../models/api/ContainerModuleMetadataApi';
import { ContainerModuleCreateInstancesTaskKind } from '../models/domain/ContainerModuleCreateInstancesTaskKind';
import { ContainerModuleLoadFromMetadataTaskKind } from '../models/domain/ContainerModuleLoadFromMetadataTaskKind';
import { ContainerModuleTaskKind } from '../models/domain/ContainerModuleTaskKind';
import { ContainerModuleTaskKindType } from '../models/domain/ContainerModuleTaskKindType';
import { ContainerModuleTaskDependencyEngine } from './ContainerModuleTaskDependencyEngine';

describe(ContainerModuleTaskDependencyEngine.name, () => {
  let containerModuleTaskDependencyEngine: ContainerModuleTaskDependencyEngine;

  beforeAll(() => {
    containerModuleTaskDependencyEngine =
      new ContainerModuleTaskDependencyEngine();
  });

  describe('.getDependencies', () => {
    describe('having a task kind of type createInstances', () => {
      let taskKindFixture: ContainerModuleCreateInstancesTaskKind;

      beforeAll(() => {
        taskKindFixture = ContainerModuleCreateInstancesTaskKindMocks.any;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            containerModuleTaskDependencyEngine.getDependencies(
              taskKindFixture,
            );
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw an error', () => {
          expect(result).toBeInstanceOf(Error);
          expect(result).toStrictEqual(
            expect.objectContaining<Partial<Error>>({
              message: 'Unsupported type',
            }),
          );
        });
      });
    });

    describe('having a task kind with metadata with no imports nor injects', () => {
      let taskKindFixture: ContainerModuleLoadFromMetadataTaskKind;

      beforeAll(() => {
        taskKindFixture =
          ContainerModuleLoadFromMetadataTaskKindMocks.withMetadataWithImportsEmptyAndInjectsEmpty;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result =
            containerModuleTaskDependencyEngine.getDependencies(
              taskKindFixture,
            );
        });

        it('should return a task kind graph', () => {
          const expectedTaskKindGraphNode: cuaktask.TaskDependencyKindGraphNode<
            ContainerModuleTaskKind,
            ContainerModuleTaskKind
          > = {
            dependencies: [],
            kind: taskKindFixture,
          };

          const expectedTaskKindGraph: cuaktask.TaskDependencyKindGraph<
            ContainerModuleTaskKind,
            ContainerModuleTaskKind
          > = {
            nodes: [expectedTaskKindGraphNode],
            rootNode: expectedTaskKindGraphNode,
          };

          expect(result).toStrictEqual(expectedTaskKindGraph);
        });
      });
    });

    describe('having a task with metadata with no imports and injects', () => {
      let taskKindFixture: ContainerModuleLoadFromMetadataTaskKind;

      beforeAll(() => {
        taskKindFixture =
          ContainerModuleLoadFromMetadataTaskKindMocks.withMetadataWithImportsEmptyAndInjectsWithOneServiceId;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result =
            containerModuleTaskDependencyEngine.getDependencies(
              taskKindFixture,
            );
        });

        it('should return a task kind graph', () => {
          const expectedCreateInstancesTaskNode: cuaktask.TaskDependencyKindGraphNode<
            ContainerModuleTaskKind,
            ContainerModuleTaskKind
          > = {
            dependencies: [],
            kind: {
              serviceIds: taskKindFixture.metadata.injects,
              type: ContainerModuleTaskKindType.createInstances,
            },
          };
          const expectedTaskKindGraphNode: cuaktask.TaskDependencyKindGraphNode<
            ContainerModuleTaskKind,
            ContainerModuleTaskKind
          > = {
            dependencies: [expectedCreateInstancesTaskNode],
            kind: taskKindFixture,
          };

          const expectedTaskKindGraph: cuaktask.TaskDependencyKindGraph<
            ContainerModuleTaskKind,
            ContainerModuleTaskKind
          > = {
            nodes: [expectedTaskKindGraphNode, expectedCreateInstancesTaskNode],
            rootNode: expectedTaskKindGraphNode,
          };

          expect(result).toStrictEqual(expectedTaskKindGraph);
        });
      });
    });

    describe('having a task with imports and no injects', () => {
      let containerModuleMetadataFixture: ContainerModuleMetadataApi;
      let dependencyContainerModuleMetadataFixture: ContainerModuleMetadataApi;
      let taskKindFixture: ContainerModuleLoadFromMetadataTaskKind;

      beforeAll(() => {
        dependencyContainerModuleMetadataFixture =
          ContainerModuleMetadataApiMocks.withImportsEmptyAndInjectsEmpty;

        containerModuleMetadataFixture = {
          ...ContainerModuleMetadataApiMocks.withImportsEmptyAndInjectsEmpty,
          imports: [dependencyContainerModuleMetadataFixture],
        };

        taskKindFixture = {
          ...ContainerModuleLoadFromMetadataTaskKindMocks.any,
          metadata: containerModuleMetadataFixture,
        };
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result =
            containerModuleTaskDependencyEngine.getDependencies(
              taskKindFixture,
            );
        });

        it('should return a task kind graph', () => {
          const expectedDependencyTaskNode: cuaktask.TaskDependencyKindGraphNode<
            ContainerModuleTaskKind,
            ContainerModuleTaskKind
          > = {
            dependencies: [],
            kind: {
              metadata: dependencyContainerModuleMetadataFixture,
              type: ContainerModuleTaskKindType.loadFromMetadata,
            },
          };
          const expectedTaskKindGraphNode: cuaktask.TaskDependencyKindGraphNode<
            ContainerModuleTaskKind,
            ContainerModuleTaskKind
          > = {
            dependencies: [expectedDependencyTaskNode],
            kind: taskKindFixture,
          };

          const expectedTaskKindGraph: cuaktask.TaskDependencyKindGraph<
            ContainerModuleTaskKind,
            ContainerModuleTaskKind
          > = {
            nodes: [expectedTaskKindGraphNode, expectedDependencyTaskNode],
            rootNode: expectedTaskKindGraphNode,
          };

          expect(result).toStrictEqual(expectedTaskKindGraph);
        });
      });
    });

    describe('having a task with imports and injects', () => {
      let containerModuleMetadataFixture: ContainerModuleMetadataApi;
      let dependencyContainerModuleMetadataFixture: ContainerModuleMetadataApi;
      let taskKindFixture: ContainerModuleLoadFromMetadataTaskKind;

      beforeAll(() => {
        dependencyContainerModuleMetadataFixture =
          ContainerModuleMetadataApiMocks.withImportsEmptyAndInjectsEmpty;

        containerModuleMetadataFixture = {
          ...ContainerModuleMetadataApiMocks.withImportsEmptyAndInjectsWithOneServiceId,
          imports: [dependencyContainerModuleMetadataFixture],
        };

        taskKindFixture = {
          ...ContainerModuleLoadFromMetadataTaskKindMocks.any,
          metadata: containerModuleMetadataFixture,
        };
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result =
            containerModuleTaskDependencyEngine.getDependencies(
              taskKindFixture,
            );
        });

        it('should return a task kind graph', () => {
          const expectedDependencyTaskNode: cuaktask.TaskDependencyKindGraphNode<
            ContainerModuleTaskKind,
            ContainerModuleTaskKind
          > = {
            dependencies: [],
            kind: {
              metadata: dependencyContainerModuleMetadataFixture,
              type: ContainerModuleTaskKindType.loadFromMetadata,
            },
          };
          const expectedCreateInstancesTaskNode: cuaktask.TaskDependencyKindGraphNode<
            ContainerModuleTaskKind,
            ContainerModuleTaskKind
          > = {
            dependencies: [expectedDependencyTaskNode],
            kind: {
              serviceIds: taskKindFixture.metadata.injects,
              type: ContainerModuleTaskKindType.createInstances,
            },
          };
          const expectedTaskKindGraphNode: cuaktask.TaskDependencyKindGraphNode<
            ContainerModuleTaskKind,
            ContainerModuleTaskKind
          > = {
            dependencies: [expectedCreateInstancesTaskNode],
            kind: taskKindFixture,
          };

          const expectedTaskKindGraph: cuaktask.TaskDependencyKindGraph<
            ContainerModuleTaskKind,
            ContainerModuleTaskKind
          > = {
            nodes: [
              expectedTaskKindGraphNode,
              expectedCreateInstancesTaskNode,
              expectedDependencyTaskNode,
            ],
            rootNode: expectedTaskKindGraphNode,
          };

          expect(result).toStrictEqual(expectedTaskKindGraph);
        });
      });
    });
  });
});
