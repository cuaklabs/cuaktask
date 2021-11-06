import { ServiceId } from '../../../common/models/domain/ServiceId';
import { TaskScope } from '../../../task/models/domain/TaskScope';

export interface BindingApi {
  id?: ServiceId;
  scope?: TaskScope;
}
