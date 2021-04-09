import { AbstractGetCollectionState } from './abstract-get-collection-state'
import { AbstractModel } from '../../../models'
import {
  AbstractPagingBehaviour,
  PagingBehaviourUsingOffsetSize,
} from '../../pagination'

export abstract class AbstractGetCollectionStateWithOffsetSizePaging<
  T extends AbstractModel
> extends AbstractGetCollectionState<T> {
  protected size: number

  protected offset: number

  protected definePagingBehaviour(): AbstractPagingBehaviour {
    return new PagingBehaviourUsingOffsetSize(
      this.req.fullUrl(),
      this.databaseResult.totalNumberOfResult,
      this.offset,
      this.size,
      this.getAcceptedMediaType(),
      this.getDefaultSize()
    )
  }

  protected extractFromRequest(): void {
    super.extractFromRequest()
    this.size = this.extractNumberFromQuery('size', this.getDefaultSize())
    this.offset = this.extractNumberFromQuery('offset', this.getDefaultOffset())
  }

  protected getDefaultSize(): number {
    return 10
  }

  protected getDefaultOffset(): number {
    return 0
  }
}
