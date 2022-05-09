import * as cuaktask from '@cuaklabs/cuaktask';

import { Binding } from '../../binding/models/domain/Binding';
import { BindingType } from '../../binding/models/domain/BindingType';
import { TypeBinding } from '../../binding/models/domain/TypeBinding';
import { BindingService } from '../../binding/services/domain/BindingService';
import { lazyGetBindingOrThrow } from '../../binding/utils/domain/lazyGetBindingOrThrow';
import { ClassMetadata } from '../../classMetadata/models/domain/ClassMetadata';
import { ServiceId } from '../../common/models/domain/ServiceId';
import { Builder } from '../../common/modules/domain/Builder';
import { SetLike } from '../../common/modules/domain/SetLike';
import { MetadataService } from '../../metadata/services/domain/MetadataService';
import { stringifyServiceId } from '../../utils/stringifyServiceId';
import { CreateInstanceRootTaskKind } from '../models/domain/CreateInstanceRootTaskKind';
import { CreateInstanceTaskKind } from '../models/domain/CreateInstanceTaskKind';
import { GetInstanceDependenciesTaskKind } from '../models/domain/GetInstanceDependenciesTaskKind';
import { TaskKind } from '../models/domain/TaskKind';
import { TaskKindType } from '../models/domain/TaskKindType';

type CreateInstanceTaskKindGraphNode = cuaktask.TaskDependencyKindGraphNode<
  CreateInstanceTaskKind,
  TaskKind
>;

type GetInstanceDependenciesTaskKindGraphNode =
  cuaktask.TaskDependencyKindGraphNode<
    GetInstanceDependenciesTaskKind,
    CreateInstanceTaskKind
  >;

type TaskKindGraphNode = cuaktask.TaskDependencyKindGraphNode<
  TaskKind,
  TaskKind
>;

type TaskKindGraph = cuaktask.TaskDependencyKindGraph<TaskKind, TaskKind>;

export class CreateInstancesTaskDependencyEngine
  implements cuaktask.TaskDependencyEngine<TaskKind, TaskKind>
{
  readonly #containerBindingService: BindingService;
  readonly #metadataService: MetadataService;
  readonly #taskKindSerBuilder: Builder<SetLike<TaskKind>>;

  constructor(
    containerBindingService: BindingService,
    metadataService: MetadataService,
    taskKindSerBuilder: Builder<SetLike<TaskKind>>,
  ) {
    this.#containerBindingService = containerBindingService;
    this.#metadataService = metadataService;
    this.#taskKindSerBuilder = taskKindSerBuilder;
  }

  public getDependencies(taskKind: TaskKind): TaskKindGraph {
    switch (taskKind.type) {
      case TaskKindType.getInstanceDependencies:
        throw new Error('Unsupported type');
      case TaskKindType.createInstance:
        throw new Error('Unsupported type');
      case TaskKindType.createInstanceRoot:
        return this.#getCreateInstanceTaskKindDependencies(taskKind);
    }
  }

  #getBinding(serviceId: ServiceId): Binding {
    const binding: Binding =
      this.#containerBindingService.get(serviceId) ??
      lazyGetBindingOrThrow(serviceId, this.#metadataService);

    return binding;
  }

  #getCreateInstanceTaskKindDependencies(
    taskKind: CreateInstanceRootTaskKind,
  ): TaskKindGraph {
    const taskDependencyKindGraphRootNode: CreateInstanceTaskKindGraphNode = {
      dependencies: [],
      kind: { ...taskKind, type: TaskKindType.createInstance },
    };

    const taskKindSet: SetLike<TaskKind> = this.#taskKindSerBuilder.build();

    const taskDependencyKindGraph: TaskKindGraph = {
      nodes: [
        ...this.#expandCreateInstanceTaskKindGraphNodes(
          taskDependencyKindGraphRootNode,
          taskKindSet,
        ),
      ],
      rootNode: taskDependencyKindGraphRootNode,
    };

    return taskDependencyKindGraph;
  }

  #getGetInstanceDependenciesTaskKind(
    binding: TypeBinding,
    taskKind: CreateInstanceTaskKind,
  ): GetInstanceDependenciesTaskKind {
    const metadata: ClassMetadata = this.#metadataService.getClassMetadata(
      binding.type,
    );

    const getInstanceDependenciesTaskKind: GetInstanceDependenciesTaskKind = {
      id: taskKind.id,
      metadata: metadata,
      requestId: taskKind.requestId,
      type: TaskKindType.getInstanceDependencies,
    };

    return getInstanceDependenciesTaskKind;
  }

  #getGetInstanceDependenciesTaskKindDependencies(
    taskKind: GetInstanceDependenciesTaskKind,
  ): CreateInstanceTaskKind[] {
    const serviceIds: ServiceId[] =
      this.#getInstanceDependenciesTaskKindDependenciesServiceIds(taskKind);

    const createInstanceTaskKinds: CreateInstanceTaskKind[] = serviceIds.map(
      (serviceId: ServiceId) => ({
        id: serviceId,
        requestId: taskKind.requestId,
        type: TaskKindType.createInstance,
      }),
    );

    return createInstanceTaskKinds;
  }

  #getGetInstanceDependenciesTaskKindGraphNode(
    binding: TypeBinding,
    taskKind: CreateInstanceTaskKind,
  ): GetInstanceDependenciesTaskKindGraphNode {
    const getInstanceDependenciesTaskKind: GetInstanceDependenciesTaskKind =
      this.#getGetInstanceDependenciesTaskKind(binding, taskKind);

    const createDependencyTaskKinds: CreateInstanceTaskKind[] =
      this.#getGetInstanceDependenciesTaskKindDependencies(
        getInstanceDependenciesTaskKind,
      );

    const createDependencyInstanceTaskKindGraphNodes: CreateInstanceTaskKindGraphNode[] =
      createDependencyTaskKinds.map((taskKind: CreateInstanceTaskKind) => ({
        dependencies: [],
        kind: taskKind,
      }));

    const getInstanceDependenciesTaskNode: GetInstanceDependenciesTaskKindGraphNode =
      {
        dependencies: createDependencyInstanceTaskKindGraphNodes,
        kind: getInstanceDependenciesTaskKind,
      };

    return getInstanceDependenciesTaskNode;
  }

  #getInstanceDependenciesTaskKindDependenciesServiceIds(
    taskKind: GetInstanceDependenciesTaskKind,
  ): ServiceId[] {
    const metadata: ClassMetadata = taskKind.metadata;

    // GetInstanceDependenciesTask.innerPerfomr relies on this order
    const servicesId: ServiceId[] = [
      ...metadata.constructorArguments,
      ...metadata.properties.values(),
    ];

    return servicesId;
  }

  *#expandCreateInstanceTaskKindGraphNodes(
    createInstanceTaskKindGraphNode: CreateInstanceTaskKindGraphNode,
    taskKindSet: SetLike<TaskKind>,
  ): Iterable<TaskKindGraphNode> {
    const taskKind: TaskKind = createInstanceTaskKindGraphNode.kind;
    const binding: Binding = this.#getBinding(taskKind.id);

    if (binding.bindingType === BindingType.type) {
      yield* this.#expandCreateInstanceTypeTaskKindGraphNodes(
        createInstanceTaskKindGraphNode,
        binding,
        taskKind,
        taskKindSet,
      );
    } else {
      yield createInstanceTaskKindGraphNode;
    }
  }

  *#expandCreateInstanceTypeTaskKindGraphNodes(
    createInstanceTaskKindGraphNode: CreateInstanceTaskKindGraphNode,
    binding: TypeBinding,
    taskKind: CreateInstanceTaskKind,
    taskKindSet: SetLike<TaskKind>,
  ): Iterable<TaskKindGraphNode> {
    if (taskKindSet.has(taskKind)) {
      throw new Error(
        `Circular dependency found related to ${stringifyServiceId(
          taskKind.id,
        )}!`,
      );
    } else {
      taskKindSet.add(taskKind);

      const getInstanceDependenciesTaskNode: GetInstanceDependenciesTaskKindGraphNode =
        this.#getGetInstanceDependenciesTaskKindGraphNode(binding, taskKind);

      createInstanceTaskKindGraphNode.dependencies.push(
        getInstanceDependenciesTaskNode,
      );

      yield createInstanceTaskKindGraphNode;
      yield getInstanceDependenciesTaskNode;

      for (const createDependencyInstanceTaskKindGraphNode of getInstanceDependenciesTaskNode.dependencies) {
        yield* this.#expandCreateInstanceTaskKindGraphNodes(
          createDependencyInstanceTaskKindGraphNode,
          taskKindSet,
        );
      }

      taskKindSet.delete(taskKind);
    }
  }
}
