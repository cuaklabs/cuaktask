jest.mock('../../../binding/utils/domain/lazyGetBindingOrThrow');

import { TypeBindingFixtures } from '../../../binding/fixtures/domain/TypeBindingFixtures';
import { ValueBindingFixtures } from '../../../binding/fixtures/domain/ValueBindingFixtures';
import { Binding } from '../../../binding/models/domain/Binding';
import { TypeBinding } from '../../../binding/models/domain/TypeBinding';
import { ValueBinding } from '../../../binding/models/domain/ValueBinding';
import { BindingService } from '../../../binding/services/domain/BindingService';
import { lazyGetBindingOrThrow } from '../../../binding/utils/domain/lazyGetBindingOrThrow';
import { ContainerRequestService } from '../../../container/services/domain/ContainerRequestService';
import { ContainerSingletonService } from '../../../container/services/domain/ContainerSingletonService';
import { MetadataService } from '../../../metadata/services/domain/MetadataService';
import { CreateInstanceTaskKindFixtures } from '../../fixtures/domain/CreateInstanceTaskKindFixtures';
import { ServiceDependenciesFixtures } from '../../fixtures/domain/ServiceDependenciesFixtures';
import { CreateInstanceTaskKind } from '../domain/CreateInstanceTaskKind';
import { CreateInstanceTask } from './CreateInstanceTask';

class InstanceTest {
  constructor(public readonly foo?: string) {}
}

describe(CreateInstanceTask.name, () => {
  let containerBindingServiceMock: jest.Mocked<BindingService>;
  let containerRequestServiceMock: jest.Mocked<ContainerRequestService>;
  let containerSingletonServiceMock: jest.Mocked<ContainerSingletonService>;
  let metadataServiceMock: jest.Mocked<MetadataService>;

  beforeAll(() => {
    containerBindingServiceMock = {
      get: jest.fn(),
    } as Partial<jest.Mocked<BindingService>> as jest.Mocked<BindingService>;

    containerRequestServiceMock = {
      get: jest.fn(),
      set: jest.fn(),
    } as Partial<
      jest.Mocked<ContainerRequestService>
    > as jest.Mocked<ContainerRequestService>;

    containerSingletonServiceMock = {
      get: jest.fn(),
      set: jest.fn(),
    } as Partial<
      jest.Mocked<ContainerSingletonService>
    > as jest.Mocked<ContainerSingletonService>;

    metadataServiceMock = {
      getBindingMetadata: jest.fn(),
    } as Partial<jest.Mocked<MetadataService>> as jest.Mocked<MetadataService>;
  });

  describe('.perform()', () => {
    describe('having a task', () => {
      let taskKindFixture: CreateInstanceTaskKind;

      beforeAll(() => {
        taskKindFixture = CreateInstanceTaskKindFixtures.any;
      });

      describe('when called and containerService.binding.get() returns no binding and lazyGetBindingOrThrow() returns a Binding in transient scope', () => {
        let bindingFixture: TypeBinding<InstanceTest, [] | [string]>;
        let createInstanceTask: CreateInstanceTask<InstanceTest, [] | [string]>;

        let result: unknown;

        beforeAll(() => {
          const instanceConstructorCallMock: jest.Mock<
            InstanceTest,
            [] | [string]
          > = jest
            .fn<InstanceTest, []>()
            .mockImplementation((foo?: string) => new InstanceTest(foo));

          bindingFixture = {
            ...TypeBindingFixtures.withScopeTransient,
            type: instanceConstructorCallMock,
          };

          containerBindingServiceMock.get.mockReturnValueOnce(undefined);

          (
            lazyGetBindingOrThrow as jest.Mock<
              Binding<InstanceTest, [] | [string]>
            >
          ).mockReturnValueOnce(bindingFixture);

          createInstanceTask = new CreateInstanceTask(
            taskKindFixture,
            containerBindingServiceMock,
            containerRequestServiceMock,
            containerSingletonServiceMock,
            metadataServiceMock,
          );

          result = createInstanceTask.perform(
            ServiceDependenciesFixtures.withConstructorArgumentsAndProperties,
          );
        });

        afterAll(() => {
          jest.clearAllMocks();
        });

        it('should call containerBindingService.get()', () => {
          expect(containerBindingServiceMock.get).toHaveBeenCalledTimes(1);
          expect(containerBindingServiceMock.get).toHaveBeenCalledWith(
            taskKindFixture.id,
          );
        });

        it('should call lazyGetBindingOrThrow()', () => {
          expect(lazyGetBindingOrThrow).toHaveBeenCalledTimes(1);
          expect(lazyGetBindingOrThrow).toHaveBeenCalledWith(
            taskKindFixture.id,
            metadataServiceMock,
          );
        });

        it('should return an instance of InstanceTest with properties set', () => {
          expect(result).toBeInstanceOf(InstanceTest);

          Object.entries(
            ServiceDependenciesFixtures.withConstructorArgumentsAndProperties
              .properties,
          ).map(([key, value]: [string, unknown]): void => {
            expect(result).toHaveProperty(key);
            expect((result as Record<string, unknown>)[key]).toBe(value);
          });
        });
      });

      describe('when called and containerService.binding.get() returns a type binding with transient scope', () => {
        let bindingFixture: TypeBinding<InstanceTest>;
        let createInstanceTask: CreateInstanceTask<InstanceTest, [] | [string]>;

        let result: unknown;

        beforeAll(() => {
          const instanceConstructorCallMock: jest.Mock<InstanceTest> = jest
            .fn<InstanceTest, []>()
            .mockImplementation((foo?: string) => new InstanceTest(foo));

          bindingFixture = {
            ...TypeBindingFixtures.withScopeTransient,
            type: instanceConstructorCallMock,
          };

          containerBindingServiceMock.get.mockReturnValueOnce(bindingFixture);

          createInstanceTask = new CreateInstanceTask(
            taskKindFixture,
            containerBindingServiceMock,
            containerRequestServiceMock,
            containerSingletonServiceMock,
            metadataServiceMock,
          );

          result = createInstanceTask.perform(
            ServiceDependenciesFixtures.withConstructorArgumentsAndProperties,
          );
        });

        afterAll(() => {
          jest.clearAllMocks();
        });

        it('should call containerBindingService.binding.get()', () => {
          expect(containerBindingServiceMock.get).toHaveBeenCalledTimes(1);
          expect(containerBindingServiceMock.get).toHaveBeenCalledWith(
            taskKindFixture.id,
          );
        });

        it('should call bindingFixture.type()', () => {
          expect(bindingFixture.type).toHaveBeenCalledTimes(1);
          expect(bindingFixture.type).toHaveBeenCalledWith(
            ...ServiceDependenciesFixtures.withConstructorArgumentsAndProperties
              .constructorArguments,
          );
        });

        it('should return an instance of InstanceTest with properties set', () => {
          expect(result).toBeInstanceOf(InstanceTest);

          Object.entries(
            ServiceDependenciesFixtures.withConstructorArgumentsAndProperties
              .properties,
          ).map(([key, value]: [string, unknown]): void => {
            expect(result).toHaveProperty(key);
            expect((result as Record<string, unknown>)[key]).toBe(value);
          });
        });
      });

      describe('when called and containerService.binding.get() returns a type binding with singleton scope and containerService.singleton.get() returns no instance', () => {
        let bindingFixture: TypeBinding<InstanceTest>;
        let createInstanceTask: CreateInstanceTask<InstanceTest, [] | [string]>;

        let result: unknown;

        beforeAll(() => {
          const instanceConstructorCallMock: jest.Mock<InstanceTest> = jest
            .fn<InstanceTest, []>()
            .mockImplementation((foo?: string) => new InstanceTest(foo));

          bindingFixture = {
            ...TypeBindingFixtures.withScopeSingleton,
            type: instanceConstructorCallMock,
          };

          containerBindingServiceMock.get.mockReturnValueOnce(bindingFixture);

          containerSingletonServiceMock.get.mockReturnValueOnce(undefined);

          createInstanceTask = new CreateInstanceTask(
            taskKindFixture,
            containerBindingServiceMock,
            containerRequestServiceMock,
            containerSingletonServiceMock,
            metadataServiceMock,
          );

          result = createInstanceTask.perform(
            ServiceDependenciesFixtures.withConstructorArgumentsAndProperties,
          );
        });

        afterAll(() => {
          jest.clearAllMocks();
        });

        it('should call containerBindingService.get()', () => {
          expect(containerBindingServiceMock.get).toHaveBeenCalledTimes(1);
          expect(containerBindingServiceMock.get).toHaveBeenCalledWith(
            taskKindFixture.id,
          );
        });

        it('should call containerSingletonService.get()', () => {
          expect(containerSingletonServiceMock.get).toHaveBeenCalledTimes(1);
          expect(containerSingletonServiceMock.get).toHaveBeenCalledWith(
            taskKindFixture.id,
          );
        });

        it('should call bindingFixture.type()', () => {
          expect(bindingFixture.type).toHaveBeenCalledTimes(1);
          expect(bindingFixture.type).toHaveBeenCalledWith(
            ...ServiceDependenciesFixtures.withConstructorArgumentsAndProperties
              .constructorArguments,
          );
        });

        it('should call containerSingletonService.set()', () => {
          expect(containerSingletonServiceMock.set).toHaveBeenCalledTimes(1);
          expect(containerSingletonServiceMock.set).toHaveBeenCalledWith(
            taskKindFixture.id,
            expect.any(InstanceTest),
          );
          Object.entries(
            ServiceDependenciesFixtures.withConstructorArgumentsAndProperties
              .properties,
          ).map(([key, value]: [string, unknown]): void => {
            expect(containerSingletonServiceMock.set).toHaveBeenCalledWith(
              taskKindFixture.id,
              expect.objectContaining({ [key]: value }),
            );
          });
        });

        it('should return an instance of InstanceTest with properties set', () => {
          expect(result).toBeInstanceOf(InstanceTest);

          Object.entries(
            ServiceDependenciesFixtures.withConstructorArgumentsAndProperties
              .properties,
          ).map(([key, value]: [string, unknown]): void => {
            expect(result).toHaveProperty(key);
            expect((result as Record<string, unknown>)[key]).toBe(value);
          });
        });
      });

      describe('when called and containerService.binding.get() returns a type binding with singleton scope and containerService.singleton.get() returns an instance', () => {
        let bindingFixture: TypeBinding<InstanceTest>;
        let instanceTestFixture: InstanceTest;
        let createInstanceTask: CreateInstanceTask<InstanceTest, [] | [string]>;

        let result: unknown;

        beforeAll(() => {
          const instanceConstructorCallMock: jest.Mock<InstanceTest> = jest.fn<
            InstanceTest,
            []
          >();

          bindingFixture = {
            ...TypeBindingFixtures.withScopeSingleton,
            type: instanceConstructorCallMock,
          };

          instanceTestFixture = new InstanceTest();

          containerBindingServiceMock.get.mockReturnValueOnce(bindingFixture);

          containerSingletonServiceMock.get.mockReturnValueOnce(
            instanceTestFixture,
          );

          createInstanceTask = new CreateInstanceTask(
            taskKindFixture,
            containerBindingServiceMock,
            containerRequestServiceMock,
            containerSingletonServiceMock,
            metadataServiceMock,
          );

          result = createInstanceTask.perform(
            ServiceDependenciesFixtures.withConstructorArgumentsEmptyAndPropertiesEmpty,
          );
        });

        afterAll(() => {
          jest.clearAllMocks();
        });

        it('should call containerBindingService.get()', () => {
          expect(containerBindingServiceMock.get).toHaveBeenCalledTimes(1);
          expect(containerBindingServiceMock.get).toHaveBeenCalledWith(
            taskKindFixture.id,
          );
        });

        it('should call containerSingletonService.singleton.get()', () => {
          expect(containerSingletonServiceMock.get).toHaveBeenCalledTimes(1);
          expect(containerSingletonServiceMock.get).toHaveBeenCalledWith(
            taskKindFixture.id,
          );
        });

        it('should not call bindingFixture.type()', () => {
          expect(bindingFixture.type).not.toHaveBeenCalled();
        });

        it('should return an instance of InstanceTest', () => {
          expect(result).toBe(instanceTestFixture);
        });
      });

      describe('when called and containerService.binding.get() returns a type binding with request scope and containerService.request.get() returns no instance', () => {
        let bindingFixture: TypeBinding<InstanceTest>;
        let createInstanceTask: CreateInstanceTask<InstanceTest, [] | [string]>;

        let result: unknown;

        beforeAll(() => {
          const instanceConstructorCallMock: jest.Mock<InstanceTest> = jest
            .fn<InstanceTest, [] | [string]>()
            .mockImplementation((foo?: string) => new InstanceTest(foo));

          bindingFixture = {
            ...TypeBindingFixtures.withScopeRequest,
            type: instanceConstructorCallMock,
          };

          containerBindingServiceMock.get.mockReturnValueOnce(bindingFixture);

          containerRequestServiceMock.get.mockReturnValueOnce(undefined);

          createInstanceTask = new CreateInstanceTask(
            taskKindFixture,
            containerBindingServiceMock,
            containerRequestServiceMock,
            containerSingletonServiceMock,
            metadataServiceMock,
          );

          result = createInstanceTask.perform(
            ServiceDependenciesFixtures.withConstructorArgumentsAndProperties,
          );
        });

        afterAll(() => {
          jest.clearAllMocks();
        });

        it('should call containerBindingService.get()', () => {
          expect(containerBindingServiceMock.get).toHaveBeenCalledTimes(1);
          expect(containerBindingServiceMock.get).toHaveBeenCalledWith(
            taskKindFixture.id,
          );
        });

        it('should call containerRequestServiceMock.get()', () => {
          expect(containerRequestServiceMock.get).toHaveBeenCalledTimes(1);
          expect(containerRequestServiceMock.get).toHaveBeenCalledWith(
            taskKindFixture.requestId,
            taskKindFixture.id,
          );
        });

        it('should call bindingFixture.type()', () => {
          expect(bindingFixture.type).toHaveBeenCalledTimes(1);
          expect(bindingFixture.type).toHaveBeenCalledWith(
            ...ServiceDependenciesFixtures.withConstructorArgumentsAndProperties
              .constructorArguments,
          );
        });

        it('should call containerRequestServiceMock.set()', () => {
          expect(containerRequestServiceMock.set).toHaveBeenCalledTimes(1);
          expect(containerRequestServiceMock.set).toHaveBeenCalledWith(
            taskKindFixture.requestId,
            taskKindFixture.id,
            expect.any(InstanceTest),
          );
          Object.entries(
            ServiceDependenciesFixtures.withConstructorArgumentsAndProperties
              .properties,
          ).map(([key, value]: [string, unknown]): void => {
            expect(containerSingletonServiceMock.set).toHaveBeenCalledWith(
              taskKindFixture.requestId,
              taskKindFixture.id,
              expect.objectContaining({ [key]: value }),
            );
          });
        });

        it('should return an instance of InstanceTest with properties set', () => {
          expect(result).toBeInstanceOf(InstanceTest);

          Object.entries(
            ServiceDependenciesFixtures.withConstructorArgumentsAndProperties
              .properties,
          ).map(([key, value]: [string, unknown]): void => {
            expect(result).toHaveProperty(key);
            expect((result as Record<string, unknown>)[key]).toBe(value);
          });
        });
      });

      describe('when called and containerService.binding.get() returns a type binding with request scope and containerService.request.get() returns an instance', () => {
        let bindingFixture: TypeBinding<InstanceTest>;
        let instanceTestFixture: InstanceTest;
        let createInstanceTask: CreateInstanceTask<InstanceTest, [] | [string]>;

        let result: unknown;

        beforeAll(() => {
          const instanceConstructorCallMock: jest.Mock<InstanceTest> = jest.fn<
            InstanceTest,
            []
          >();

          bindingFixture = {
            ...TypeBindingFixtures.withScopeRequest,
            type: instanceConstructorCallMock,
          };

          instanceTestFixture = new InstanceTest();

          containerBindingServiceMock.get.mockReturnValueOnce(bindingFixture);

          containerRequestServiceMock.get.mockReturnValueOnce(
            instanceTestFixture,
          );

          createInstanceTask = new CreateInstanceTask(
            taskKindFixture,
            containerBindingServiceMock,
            containerRequestServiceMock,
            containerSingletonServiceMock,
            metadataServiceMock,
          );

          result = createInstanceTask.perform(
            ServiceDependenciesFixtures.withConstructorArgumentsEmptyAndPropertiesEmpty,
          );
        });

        afterAll(() => {
          jest.clearAllMocks();
        });

        it('should call containerBindingService.get()', () => {
          expect(containerBindingServiceMock.get).toHaveBeenCalledTimes(1);
          expect(containerBindingServiceMock.get).toHaveBeenCalledWith(
            taskKindFixture.id,
          );
        });

        it('should call containerRequestServiceMock.get()', () => {
          expect(containerRequestServiceMock.get).toHaveBeenCalledTimes(1);
          expect(containerRequestServiceMock.get).toHaveBeenCalledWith(
            taskKindFixture.requestId,
            taskKindFixture.id,
          );
        });

        it('should not call bindingFixture.type()', () => {
          expect(bindingFixture.type).not.toHaveBeenCalled();
        });

        it('should return an instance of InstanceTest', () => {
          expect(result).toBe(instanceTestFixture);
        });
      });

      describe('when called and containerService.binding.get() returns a value binding', () => {
        let bindingFixture: ValueBinding<InstanceTest>;
        let createInstanceTask: CreateInstanceTask<InstanceTest, [] | [string]>;

        let result: unknown;

        beforeAll(() => {
          bindingFixture = {
            ...ValueBindingFixtures.any,
            value: new InstanceTest('fooValue'),
          };

          containerBindingServiceMock.get.mockReturnValueOnce(bindingFixture);

          createInstanceTask = new CreateInstanceTask(
            taskKindFixture,
            containerBindingServiceMock,
            containerRequestServiceMock,
            containerSingletonServiceMock,
            metadataServiceMock,
          );

          result = createInstanceTask.perform(
            ServiceDependenciesFixtures.withConstructorArgumentsEmptyAndPropertiesEmpty,
          );
        });

        afterAll(() => {
          jest.clearAllMocks();
        });

        it('should return an instance', () => {
          expect(result).toBe(bindingFixture.value);
        });
      });
    });
  });
});
