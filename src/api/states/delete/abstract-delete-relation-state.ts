import { AbstractDeleteState } from './abstract-delete-state'
import { AbstractModel } from '../../abstract-model'
import { ModelId } from '../../types'
import { FastifyRequest } from 'fastify'

export abstract class AbstractDeleteRelationState<
  T extends AbstractModel
> extends AbstractDeleteState<T> {
  protected parentId: ModelId

  protected _req: FastifyRequest<{ Params: { id: ModelId; parentId: ModelId } }>

  protected extractFromRequest(): void {
    super.extractFromRequest()
    this.parentId = this._req.params.parentId
  }
}
