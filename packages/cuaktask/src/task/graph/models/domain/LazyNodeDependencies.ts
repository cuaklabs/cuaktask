import { BaseNodeDependencies } from './BaseNodeDependencies';
import { NodeDependencies } from './NodeDependencies';
import { NodeDependenciesType } from './NodeExecutionOperator';

export interface LazyNodeDependencies<TElem>
  extends BaseNodeDependencies<NodeDependenciesType.lazy> {
  loadDependencies(): NodeDependencies<TElem>;
}
