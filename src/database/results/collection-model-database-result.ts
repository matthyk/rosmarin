import { AbstractModel } from '../../models/abstract-model'
import { AbstractDatabaseResult } from './abstract-database-result'

export class CollectionModelDatabaseResult<
  T extends AbstractModel = AbstractModel
> extends AbstractDatabaseResult {
  private _databaseResult: T[]

  public totalNumberOfResult = 0

  public get databaseResult(): T[] {
    return this._databaseResult
  }

  public set databaseResult(value: T[]) {
    this._databaseResult = Array.isArray(value) ? value : []
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
