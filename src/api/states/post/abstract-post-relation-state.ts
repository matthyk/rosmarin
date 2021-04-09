import { AbstractModel, AbstractViewModel, ModelId } from '../../../models'
import { AbstractPostState } from './abstract-post-state'
import { FastifyRequest } from 'fastify'

export abstract class AbstractPostRelationState<
  T extends AbstractModel,
  V extends AbstractViewModel
> extends AbstractPostState<T, V> {
  protected parentId: ModelId

  protected req: FastifyRequest<{ Body: V }>

  protected extractFromRequest(): void {
    super.extractFromRequest()
    this.parentId = this.extractFromParams('id')
  }
}
