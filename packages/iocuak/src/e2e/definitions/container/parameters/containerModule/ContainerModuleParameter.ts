import sinon from 'sinon';

import { ContainerModuleApi } from '../../../../../container/modules/api/ContainerModuleApi';
import { TypeServiceParameter } from '../../../common/parameters/typeService/TypeServiceParameter';
import { ValueServiceParameter } from '../../../common/parameters/valueService/ValueServiceParameter';

export interface ContainerModuleParameter {
  containerModule: ContainerModuleApi;
  loadSpy: sinon.SinonSpy;
  typeServices: TypeServiceParameter[];
  valueServices: ValueServiceParameter[];
}
