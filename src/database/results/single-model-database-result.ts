import { AbstractModel } from '../../models/abstract-model'
import { AbstractDatabaseResult } from './abstract-database-result'

export class SingleModelDatabaseResult<
  T extends AbstractModel
> extends AbstractDatabaseResult {
  private readonly _result: T

  protected found: boolean

  constructor()
  constructor(result: T)
  constructor(result?: T) {
    super()
    this._result = result
    this.found = result !== undefined
  }

  public get result(): T {
    return this._result
  }

  public isEmpty(): boolean {
    return this.found === false
  }
}
