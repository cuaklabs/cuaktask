import { Node, Task } from '@cuaklabs/cuaktask';

import { TaskGraphExpandOperationContext } from './TaskGraphExpandOperationContext';

export interface TaskGraphExpandCommandBase<
  TContext extends TaskGraphExpandOperationContext,
  TTaskKindType,
  TNodeTask extends Task<unknown>,
> {
  context: TContext;
  node: Node<TNodeTask, Task<unknown>>;
  taskKindType: TTaskKindType;
}
