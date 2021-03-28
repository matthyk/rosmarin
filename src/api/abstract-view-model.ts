import { AbstractModel } from './abstract-model'

export abstract class ViewModel<
  T extends AbstractModel = AbstractModel
> extends AbstractModel {
  public theModel: T

  protected constructor()
  protected constructor(theModel: T)
  protected constructor(theModel?: T) {
    super(theModel.id)
    this.theModel = theModel
  }
}
