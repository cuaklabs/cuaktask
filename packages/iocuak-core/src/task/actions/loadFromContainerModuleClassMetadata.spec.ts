import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

jest.mock('./createInstance');

import { BindingService } from '../../binding/services/BindingService';
import { ContainerModuleClassMetadata } from '../../containerModuleMetadata/models/ContainerModuleClassMetadata';
import { CreateInstanceTaskContext } from '../models/CreateInstanceTaskContext';
import { TaskContextServices } from '../models/TaskContextServices';
import { createInstance } from './createInstance';
import { loadFromContainerModuleClassMetadata } from './loadFromContainerModuleClassMetadata';

describe(loadFromContainerModuleClassMetadata.name, () => {
  let containerModuleClassMetadataMock: ContainerModuleClassMetadata;
  let taskContextMock: CreateInstanceTaskContext;

  beforeAll(() => {
    containerModuleClassMetadataMock = {
      loader: jest.fn(),
      moduleType: jest.fn(),
    } as Partial<ContainerModuleClassMetadata> as ContainerModuleClassMetadata;

    taskContextMock = {
      services: {
        bindingService: { [Symbol()]: Symbol() } as unknown as BindingService,
      } as Partial<TaskContextServices> as TaskContextServices,
    } as Partial<CreateInstanceTaskContext> as CreateInstanceTaskContext;
  });

  describe('when called', () => {
    let containerModuleInstanceFixture: unknown;

    let result: unknown;

    beforeAll(() => {
      containerModuleInstanceFixture = Symbol();

      (createInstance as jest.Mock<typeof createInstance>).mockReturnValueOnce(
        containerModuleInstanceFixture,
      );

      result = loadFromContainerModuleClassMetadata(
        containerModuleClassMetadataMock,
        taskContextMock,
      );
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call createInstance()', () => {
      expect(createInstance).toHaveBeenCalledTimes(1);
      expect(createInstance).toHaveBeenCalledWith(
        containerModuleClassMetadataMock.moduleType,
        taskContextMock,
      );
    });

    it('should call containerModuleClassMetadata.loader()', () => {
      expect(containerModuleClassMetadataMock.loader).toHaveBeenCalledTimes(1);
      expect(containerModuleClassMetadataMock.loader).toHaveBeenCalledWith(
        containerModuleInstanceFixture,
        taskContextMock.services.bindingService,
      );
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });
});
