import { AbstractModel } from '../../models/abstract-model'
import { AbstractDatabaseResult } from './abstract-database-result'

export class CollectionModelDatabaseResult<
  T extends AbstractModel = AbstractModel
> extends AbstractDatabaseResult {
  protected _databaseResult: T[]

  public totalNumberOfResult = 0

  public get databaseResult(): T[] {
    return this._databaseResult
  }

  constructor()
  constructor(databaseResult: T[])
  constructor(databaseResult?: T[]) {
    super()
    this._databaseResult = databaseResult ?? []
  }

  public isEmpty(): boolean {
    return this._databaseResult?.length === 0
  }
}
