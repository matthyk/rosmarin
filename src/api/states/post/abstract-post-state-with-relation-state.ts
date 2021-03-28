import { AbstractModel } from '../../abstract-model'
import { ViewModel } from '../../abstract-view-model'
import { AbstractPostState } from './abstract-post-state'
import { ModelId } from '../../types'

export abstract class AbstractPostStateWithRelationState<
  T extends AbstractModel,
  V extends ViewModel
> extends AbstractPostState<T, V> {
  private _parentId: ModelId

  public get parentId(): string | number {
    return this._parentId
  }

  public set parentId(value: string | number) {
    this._parentId = value
  }
}
