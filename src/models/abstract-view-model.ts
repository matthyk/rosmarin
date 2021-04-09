import { ModelId } from './types'
import { viewProp } from '../api'

export abstract class AbstractViewModel {
  @viewProp({
    anyOf: [{ type: 'string' }, { type: 'integer' }],
    required: false,
  })
  public id: ModelId

  public lastModifiedAt: number
}
