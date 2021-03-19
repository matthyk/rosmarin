import { AbstractState } from '../states/abstract-state'

export type Constraint<T extends AbstractState = AbstractState> = (
  this: T
) => Promise<boolean> | boolean
