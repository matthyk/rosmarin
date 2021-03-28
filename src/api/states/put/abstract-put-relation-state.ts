import { AbstractModel } from '../../abstract-model'
import { ViewModel } from '../../abstract-view-model'
import { AbstractPutState } from './abstract-put-state'
import { ModelId } from '../../types'

export abstract class AbstractPutRelationState<
  T extends AbstractModel,
  V extends ViewModel
> extends AbstractPutState<T, V> {
  protected _parentId: ModelId

  public get parentId(): ModelId {
    return this._parentId
  }

  public set parentId(value: ModelId) {
    this._parentId = value
  }
}
