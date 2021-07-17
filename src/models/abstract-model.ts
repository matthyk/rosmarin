import { ModelId } from './types'
import { modelProp } from '../api'

export abstract class AbstractModel {
  @modelProp()
  public id: ModelId

  public lastModifiedAt: number
}
