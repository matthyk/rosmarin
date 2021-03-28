import { ModelId } from './types'

export abstract class AbstractModel {

  protected constructor(id: ModelId) {
    this.id = id;
  }

  public id: ModelId

  public lastModifiedAt: number
}
