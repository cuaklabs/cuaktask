import { Newable } from '@cuaklabs/iocuak-common';
import {
  getBindingMetadata,
  TypeBinding,
  ClassMetadata,
  getClassMetadata,
} from '@cuaklabs/iocuak-models';

import { TypeBindingApi } from '../../../binding/models/api/TypeBindingApi';
import { convertBindingToBindingApi } from '../../../binding/utils/api/convertBindingToBindingApi';
import { ClassMetadataApi } from '../../../classMetadata/models/api/ClassMetadataApi';
import { convertToClassMetadataApi } from '../../../classMetadata/utils/api/convertToClassMetadataApi';
import { MetadataServiceApi } from './MetadataServiceApi';

export class MetadataServiceApiImplementation implements MetadataServiceApi {
  public getBindingMetadata<TInstance, TArgs extends unknown[]>(
    type: Newable<TInstance, TArgs>,
  ): TypeBindingApi<TInstance, TArgs> | undefined {
    const typeBinding: TypeBinding<TInstance, TArgs> | undefined =
      getBindingMetadata(type);

    return typeBinding === undefined
      ? undefined
      : convertBindingToBindingApi(typeBinding);
  }

  public getClassMetadata<TInstance, TArgs extends unknown[]>(
    type: Newable<TInstance, TArgs>,
  ): ClassMetadataApi {
    const classMetadata: ClassMetadata = getClassMetadata(type);

    return convertToClassMetadataApi(classMetadata);
  }
}
