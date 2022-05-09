import * as cuaktask from '@cuaklabs/cuaktask';

import { BindingService } from '../../binding/services/domain/BindingService';
import { ContainerRequestService } from '../../container/services/domain/ContainerRequestService';
import { ContainerSingletonService } from '../../container/services/domain/ContainerSingletonService';
import { MetadataService } from '../../metadata/services/domain/MetadataService';
import { CreateInstanceTask } from '../models/cuaktask/CreateInstanceTask';
import { GetInstanceDependenciesTask } from '../models/cuaktask/GetInstanceDependenciesTask';
import { CreateInstanceTaskKind } from '../models/domain/CreateInstanceTaskKind';
import { GetInstanceDependenciesTaskKind } from '../models/domain/GetInstanceDependenciesTaskKind';
import { TaskKindType } from '../models/domain/TaskKindType';
import { isTaskKind } from '../utils/isTaskKind';

export class TaskBuilderWithNoDependencies {
  #containerBindingService: BindingService;
  #containerRequestService: ContainerRequestService;
  #containerSingletonService: ContainerSingletonService;
  #metadataService: MetadataService;

  constructor(
    containerBindingService: BindingService,
    containerRequestService: ContainerRequestService,
    containerSingletonService: ContainerSingletonService,
    metadataService: MetadataService,
  ) {
    this.#containerBindingService = containerBindingService;
    this.#containerRequestService = containerRequestService;
    this.#containerSingletonService = containerSingletonService;
    this.#metadataService = metadataService;
  }

  public buildWithNoDependencies<TKind, TArgs extends unknown[], TReturn>(
    taskKind: TKind,
  ): cuaktask.DependentTask<TKind, unknown, TArgs, TReturn> {
    if (isTaskKind(taskKind)) {
      switch (taskKind.type) {
        case TaskKindType.createInstance:
          return this.#buildCreateInstanceTaskWithNoDependencies(
            taskKind,
          ) as unknown as cuaktask.DependentTask<
            TKind,
            unknown,
            TArgs,
            TReturn
          >;
        case TaskKindType.createInstanceRoot:
          throw new Error('Invalid task kind');
        case TaskKindType.getInstanceDependencies:
          return this.#buildGetInstanceDependenciesTaskWithNoDependencies(
            taskKind,
          ) as unknown as cuaktask.DependentTask<
            TKind,
            unknown,
            TArgs,
            TReturn
          >;
      }
    } else {
      throw new Error('Task kind not supported');
    }
  }

  #buildCreateInstanceTaskWithNoDependencies(
    taskKind: CreateInstanceTaskKind,
  ): CreateInstanceTask {
    return new CreateInstanceTask(
      taskKind,
      this.#containerBindingService,
      this.#containerRequestService,
      this.#containerSingletonService,
      this.#metadataService,
    );
  }

  #buildGetInstanceDependenciesTaskWithNoDependencies(
    taskKind: GetInstanceDependenciesTaskKind,
  ): GetInstanceDependenciesTask {
    return new GetInstanceDependenciesTask(taskKind);
  }
}
