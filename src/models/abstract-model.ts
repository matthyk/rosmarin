import { ModelId } from './types'
import { modelProp } from '../api'

export abstract class AbstractModel<T extends string | number = ModelId> {
  @modelProp()
  public id: T

  public lastModifiedAt: number
}
