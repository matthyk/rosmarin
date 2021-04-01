import { AbstractModel } from '../../abstract-model'
import { ViewModel } from '../../abstract-view-model'
import { AbstractPostState } from './abstract-post-state'
import { ModelId } from '../../types'
import { FastifyRequest } from 'fastify'

export abstract class AbstractPostStateWithRelationState<
  T extends AbstractModel,
  V extends ViewModel
> extends AbstractPostState<T, V> {
  protected parentId: ModelId

  protected req: FastifyRequest<{ Body: V; Params: { id: ModelId } }>

  protected extractFromRequest(): void {
    super.extractFromRequest()
    this.parentId = this.req.params.id
  }
}
