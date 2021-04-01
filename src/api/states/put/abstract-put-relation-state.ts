import { AbstractModel } from '../../abstract-model'
import { ViewModel } from '../../abstract-view-model'
import { AbstractPutState } from './abstract-put-state'
import { ModelId } from '../../types'
import { FastifyRequest } from 'fastify'

export abstract class AbstractPutRelationState<
  T extends AbstractModel,
  V extends ViewModel
> extends AbstractPutState<T, V> {
  protected parentId: ModelId

  protected req: FastifyRequest<{
    Body: V
    Params: { id: ModelId; parentId: ModelId }
  }>

  protected updatedId: ModelId

  protected extractFromRequest(): void {
    super.extractFromRequest()
    this.parentId = this.req.params.parentId
  }
}
