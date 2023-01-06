import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

jest.mock('./loadContainerModuleElement');
jest.mock('./loadContainerModuleElementAsync');

import { ContainerModule } from '../../containerModule/models/ContainerModule';
import { CreateInstanceTaskContext } from '../../createInstanceTask/models/CreateInstanceTaskContext';
import { ContainerModuleMetadata } from '../models/ContainerModuleMetadata';
import { ContainerModuleMetadataType } from '../models/ContainerModuleMetadataType';
import { loadContainerModule } from './loadContainerModule';
import { loadContainerModuleElement } from './loadContainerModuleElement';
import { loadContainerModuleElementAsync } from './loadContainerModuleElementAsync';

describe(loadContainerModule.name, () => {
  describe('having a sync ContainerModuleMetadata with no dependencies', () => {
    let containerModuleMock: jest.Mocked<ContainerModule>;
    let containerModuleMetadataFixture: ContainerModuleMetadata;

    beforeAll(() => {
      containerModuleMock = {
        load: jest.fn(),
      };

      containerModuleMetadataFixture = {
        factory: () => containerModuleMock,
        imports: [],
        injects: [],
        requires: [],
        type: ContainerModuleMetadataType.factory,
      };
    });

    describe('when called', () => {
      let taskContextFixture: CreateInstanceTaskContext;

      let result: unknown;

      beforeAll(() => {
        taskContextFixture = {
          [Symbol()]: Symbol(),
        } as unknown as CreateInstanceTaskContext;

        result = loadContainerModule(
          containerModuleMetadataFixture,
          taskContextFixture,
        );
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call loadContainerModuleElement()', () => {
        expect(loadContainerModuleElement).toHaveBeenCalledTimes(1);
        expect(loadContainerModuleElement).toHaveBeenCalledWith(
          containerModuleMetadataFixture,
          taskContextFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a ContainerModuleMetadata with async dependencies', () => {
    let containerModuleMock: jest.Mocked<ContainerModule>;
    let containerModuleMetadataFixture: ContainerModuleMetadata;

    beforeAll(() => {
      containerModuleMock = {
        load: jest.fn(),
      };

      containerModuleMetadataFixture = {
        factory: () => containerModuleMock,
        imports: [
          {
            factory: () => containerModuleMock,
            imports: [],
            injects: [],
            requires: [],
            type: ContainerModuleMetadataType.factory,
          },
        ],
        injects: [],
        requires: [],
        type: ContainerModuleMetadataType.factory,
      };
    });

    describe('when called', () => {
      let taskContextFixture: CreateInstanceTaskContext;

      let result: unknown;

      beforeAll(() => {
        taskContextFixture = {
          [Symbol()]: Symbol(),
        } as unknown as CreateInstanceTaskContext;

        (
          loadContainerModuleElement as jest.Mock<() => Promise<void>>
        ).mockResolvedValueOnce(undefined);

        result = loadContainerModule(
          containerModuleMetadataFixture,
          taskContextFixture,
        );
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call loadContainerModuleElement()', () => {
        expect(loadContainerModuleElement).toHaveBeenCalledTimes(1);
        expect(loadContainerModuleElement).toHaveBeenCalledWith(
          containerModuleMetadataFixture.imports[0],
          taskContextFixture,
        );
      });

      it('should call loadContainerModuleElementAsync()', () => {
        expect(loadContainerModuleElementAsync).toHaveBeenCalledWith(
          containerModuleMetadataFixture,
          taskContextFixture,
          Promise.resolve(undefined),
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});