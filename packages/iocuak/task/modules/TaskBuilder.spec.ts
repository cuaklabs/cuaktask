import { Builder, SetLike, TaskDependencyEngine } from '@cuaklabs/cuaktask';

jest.mock('../../utils/isTaskKind');

import { ContainerBindingService } from '../../container/services/domain/ContainerBindingService';
import { ContainerSingletonService } from '../../container/services/domain/ContainerSingletonService';
import { isTaskKind } from '../../utils/isTaskKind';
import { CreateInstanceTaskKindFixtures } from '../fixtures/domain/CreateInstanceTaskKindFixtures';
import { GetInstanceDependenciesTaskKindFixtures } from '../fixtures/domain/GetInstanceDependenciesTaskKindFixtures';
import { CreateInstanceTask } from '../models/cuaktask/CreateInstanceTask';
import { GetInstanceDependenciesTask } from '../models/cuaktask/GetInstanceDependenciesTask';
import { CreateInstanceTaskKind } from '../models/domain/CreateInstanceTaskKind';
import { GetInstanceDependenciesTaskKind } from '../models/domain/GetInstanceDependenciesTaskKind';
import { TaskKind } from '../models/domain/TaskKind';
import { TaskBuilder } from './TaskBuilder';

describe(TaskBuilder.name, () => {
  let taskDependenciesKindSetBuilder: jest.Mocked<
    Builder<[], SetLike<TaskKind>>
  >;
  let taskDependencyEngine: jest.Mocked<TaskDependencyEngine>;
  let containerBindingServiceMock: jest.Mocked<ContainerBindingService>;
  let containerSingletonServiceMock: jest.Mocked<ContainerSingletonService>;

  let taskBuilder: TaskBuilder;

  beforeAll(() => {
    taskDependenciesKindSetBuilder = {
      build: jest.fn().mockImplementation(() => new Set()),
    };
    taskDependencyEngine = {
      getDependencies: jest.fn(),
    };
    containerBindingServiceMock = {} as Partial<
      jest.Mocked<ContainerBindingService>
    > as jest.Mocked<ContainerBindingService>;
    containerSingletonServiceMock = {} as Partial<
      jest.Mocked<ContainerSingletonService>
    > as jest.Mocked<ContainerSingletonService>;

    taskBuilder = new TaskBuilder(
      taskDependenciesKindSetBuilder,
      taskDependencyEngine,
      containerBindingServiceMock,
      containerSingletonServiceMock,
    );
  });

  describe('.build()', () => {
    describe('when called, with a taskKind of type TaskKindType.createInstance', () => {
      let createInstanceTaskKindFixture: CreateInstanceTaskKind;
      let result: unknown;

      beforeAll(() => {
        createInstanceTaskKindFixture = CreateInstanceTaskKindFixtures.any;

        (isTaskKind as unknown as jest.Mock).mockReturnValueOnce(true);

        taskDependencyEngine.getDependencies.mockReturnValueOnce([]);

        result = taskBuilder.build(createInstanceTaskKindFixture);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call .isTaskKind()', () => {
        expect(isTaskKind).toHaveBeenCalledTimes(1);
        expect(isTaskKind).toHaveBeenCalledWith(createInstanceTaskKindFixture);
      });

      it('should return a CreateInstanceTask instance', () => {
        expect(result).toBeInstanceOf(CreateInstanceTask);
        expect(result).toStrictEqual(
          expect.objectContaining<Partial<CreateInstanceTask>>({
            dependencies: [],
            kind: createInstanceTaskKindFixture,
          }),
        );
      });
    });

    describe('when called, with a taskKind of type TaskKindType.getInstanceDependencies', () => {
      let getInstanceDependenciesTaskKindFixture: GetInstanceDependenciesTaskKind;
      let result: unknown;

      beforeAll(() => {
        getInstanceDependenciesTaskKindFixture =
          GetInstanceDependenciesTaskKindFixtures.any;

        (isTaskKind as unknown as jest.Mock).mockReturnValueOnce(true);

        taskDependencyEngine.getDependencies.mockReturnValueOnce([]);

        result = taskBuilder.build(getInstanceDependenciesTaskKindFixture);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call .isTaskKind()', () => {
        expect(isTaskKind).toHaveBeenCalledTimes(1);
        expect(isTaskKind).toHaveBeenCalledWith(
          getInstanceDependenciesTaskKindFixture,
        );
      });

      it('should return a GetInstanceDependenciesTask instance', () => {
        expect(result).toBeInstanceOf(GetInstanceDependenciesTask);
        expect(result).toStrictEqual(
          expect.objectContaining<Partial<GetInstanceDependenciesTask>>({
            dependencies: [],
            kind: getInstanceDependenciesTaskKindFixture,
          }),
        );
      });
    });
  });
});
