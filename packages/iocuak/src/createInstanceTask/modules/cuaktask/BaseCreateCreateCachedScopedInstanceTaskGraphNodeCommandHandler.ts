import * as cuaktask from '@cuaklabs/cuaktask';

import { TypeBinding } from '../../../binding/models/domain/TypeBinding';
import { ServiceId } from '../../../common/models/domain/ServiceId';
import { Handler } from '../../../common/modules/domain/Handler';
import { ContainerRequestService } from '../../../container/services/domain/ContainerRequestService';
import { ContainerSingletonService } from '../../../container/services/domain/ContainerSingletonService';
import { CreateCreateTypeBindingInstanceTaskGraphNodeCommand } from '../../models/cuaktask/CreateCreateTypeBindingInstanceTaskGraphNodeCommand';
import { CreateInstanceTask } from '../../models/cuaktask/CreateInstanceTask';
import { CreateInstanceTaskGraphExpandOperationContext } from '../../models/cuaktask/CreateInstanceTaskGraphExpandOperationContext';
import { CreateInstanceTaskGraphFromTaskKindExpandOperationContext } from '../../models/cuaktask/CreateInstanceTaskGraphFromTaskKindExpandOperationContext';
import { DestructureOneTask } from '../../models/cuaktask/DestructureOneTask';
import { GetCachedInstanceTask } from '../../models/cuaktask/GetCachedInstanceTask';
import { TaskGraphExpandCommand } from '../../models/cuaktask/TaskGraphExpandCommand';
import { CreateInstanceTaskKind } from '../../models/domain/CreateInstanceTaskKind';
import { GetCachedInstanceTaskKind } from '../../models/domain/GetCachedInstanceTaskKind';
import { TaskKind } from '../../models/domain/TaskKind';
import { TaskKindType } from '../../models/domain/TaskKindType';
import { CreateInstanceTaskLazyNode } from './CreateInstanceTaskLazyNode';

export abstract class BaseCreateCreateCachedScopedInstanceTaskGraphNodeCommandHandler
  implements
    Handler<
      CreateCreateTypeBindingInstanceTaskGraphNodeCommand,
      cuaktask.NodeDependency<cuaktask.Task<TaskKind>>
    >
{
  readonly #bus: Handler<TaskGraphExpandCommand, void | Promise<void>>;
  readonly #containerRequestService: ContainerRequestService;
  readonly #containerSingletonService: ContainerSingletonService;

  constructor(
    bus: Handler<TaskGraphExpandCommand, void | Promise<void>>,
    containerRequestService: ContainerRequestService,
    containerSingletonService: ContainerSingletonService,
  ) {
    this.#bus = bus;
    this.#containerRequestService = containerRequestService;
    this.#containerSingletonService = containerSingletonService;
  }

  public handle(
    createInstanceTaskGraphFromTypeBindingTaskKindExpandCommand: CreateCreateTypeBindingInstanceTaskGraphNodeCommand,
  ): cuaktask.NodeDependency<cuaktask.Task<TaskKind>> {
    const createInstanceTaskKindGraphNode: cuaktask.NodeDependency<
      cuaktask.Task<TaskKind>
    > = this.#getCreateInstanceTaskKindGraphNodeDependency(
      createInstanceTaskGraphFromTypeBindingTaskKindExpandCommand.context,
    );

    return createInstanceTaskKindGraphNode;
  }

  protected abstract _getServiceIdToNodeDependencyMap(
    context: CreateInstanceTaskGraphExpandOperationContext,
  ): Map<ServiceId, cuaktask.NodeDependency<cuaktask.Task<TaskKind>>>;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  #createNewCreateCachedScopedInstanceTaskKindGraphDependency(
    context: CreateInstanceTaskGraphFromTaskKindExpandOperationContext<
      CreateInstanceTaskKind<TypeBinding>
    >,
  ): cuaktask.NodeDependency<cuaktask.Task<TaskKind>> {
    const taskKind: CreateInstanceTaskKind<TypeBinding> = context.taskKind;

    const getCachedInstanceTaskNode: cuaktask.Node<cuaktask.Task<TaskKind>> =
      this.#createNewGetCachedInstanceTaskNode(taskKind);

    const createInstanceTaskLazyNode: cuaktask.Node<cuaktask.Task<TaskKind>> =
      this.#createCreateInstanceTaskLazyNode(context);

    const createInstanceTaskKindGraphDependency: cuaktask.NodeDependency<
      cuaktask.Task<TaskKind>
    > = {
      nodes: [getCachedInstanceTaskNode, createInstanceTaskLazyNode],
      type: cuaktask.NodeDependenciesType.bitwiseOr,
    };

    const destructureNode: cuaktask.Node<cuaktask.Task<TaskKind>> = {
      dependencies: createInstanceTaskKindGraphDependency,
      element: new DestructureOneTask({
        type: TaskKindType.destructureOne,
      }),
    };

    return destructureNode;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  #createCreateInstanceTaskLazyNode(
    context: CreateInstanceTaskGraphFromTaskKindExpandOperationContext<
      CreateInstanceTaskKind<TypeBinding>
    >,
  ): cuaktask.Node<cuaktask.Task<TaskKind>> {
    const taskKind: CreateInstanceTaskKind<TypeBinding> = context.taskKind;

    const createInstanceTask: CreateInstanceTask = new CreateInstanceTask(
      taskKind,
      this.#containerRequestService,
      this.#containerSingletonService,
    );

    const createInstanceTaskGraphExpandOperationContext: CreateInstanceTaskGraphExpandOperationContext =
      {
        graph: context.graph,
        requestId: context.requestId,
        serviceIdAncestorList: context.serviceIdAncestorList,
        serviceIdToRequestCreateInstanceTaskKindNode:
          context.serviceIdToRequestCreateInstanceTaskKindNode,
        serviceIdToSingletonCreateInstanceTaskKindNode:
          context.serviceIdToSingletonCreateInstanceTaskKindNode,
      };

    const createInstanceTaskLazyNode: cuaktask.Node<cuaktask.Task<TaskKind>> =
      new CreateInstanceTaskLazyNode(
        this.#bus,
        createInstanceTaskGraphExpandOperationContext,
        createInstanceTask,
      );

    return createInstanceTaskLazyNode;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  #createNewGetCachedInstanceTaskNode(
    taskKind: CreateInstanceTaskKind<TypeBinding>,
  ): cuaktask.Node<cuaktask.Task<TaskKind>> {
    const binding: TypeBinding = taskKind.binding;
    const requestId: symbol = taskKind.requestId;

    const getCachedInstanceTaskKind: GetCachedInstanceTaskKind = {
      binding: binding,
      requestId: requestId,
      type: TaskKindType.getCachedInstance,
    };

    const getCachedInstanceTaskNode: cuaktask.Node<cuaktask.Task<TaskKind>> = {
      dependencies: undefined,
      element: new GetCachedInstanceTask(
        getCachedInstanceTaskKind,
        this.#containerRequestService,
        this.#containerSingletonService,
      ),
    };

    return getCachedInstanceTaskNode;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  #getCreateInstanceTaskKindGraphNodeDependency(
    context: CreateInstanceTaskGraphFromTaskKindExpandOperationContext<
      CreateInstanceTaskKind<TypeBinding>
    >,
  ): cuaktask.NodeDependency<cuaktask.Task<TaskKind>> {
    const serviceIdToCreateInstanceTaskKindNodeDependencyMap: Map<
      ServiceId,
      cuaktask.NodeDependency<cuaktask.Task<TaskKind>>
    > = this._getServiceIdToNodeDependencyMap(context);

    const taskKind: CreateInstanceTaskKind<TypeBinding> = context.taskKind;
    const binding: TypeBinding = taskKind.binding;
    const nodeDependencyFromMap:
      | cuaktask.NodeDependency<cuaktask.Task<TaskKind>>
      | undefined = serviceIdToCreateInstanceTaskKindNodeDependencyMap.get(
      binding.id,
    );

    let createInstanceTaskKindGraphNodeDependency: cuaktask.NodeDependency<
      cuaktask.Task<TaskKind>
    >;

    if (nodeDependencyFromMap === undefined) {
      createInstanceTaskKindGraphNodeDependency =
        this.#createNewCreateCachedScopedInstanceTaskKindGraphDependency(
          context,
        );

      serviceIdToCreateInstanceTaskKindNodeDependencyMap.set(
        binding.id,
        createInstanceTaskKindGraphNodeDependency,
      );
    } else {
      createInstanceTaskKindGraphNodeDependency = nodeDependencyFromMap;
    }

    return createInstanceTaskKindGraphNodeDependency;
  }
}
