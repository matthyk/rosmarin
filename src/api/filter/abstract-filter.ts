import { AbstractModel } from '../abstract-model'
import { CollectionModelDatabaseResult } from '../../database/results/collection-model-database-result'
import { IPagingBehaviour } from './interface-paging-behaviour'
import { QueryStatement } from '../../database/query-statement'
import { StateContext } from '../state-context'
import { PagingContext } from './paging-context'

export abstract class AbstractFilter<T extends AbstractModel> {
  protected databaseResult: CollectionModelDatabaseResult<T>

  protected _pagingBehaviour: IPagingBehaviour

  protected _queryStatement: QueryStatement

  public set pagingBehaviour(value: IPagingBehaviour) {
    this._pagingBehaviour = value
  }

  public set queryStatement(value: QueryStatement) {
    this._queryStatement = value
  }

  public async startDatabaseQuery(
    context: StateContext
  ): Promise<CollectionModelDatabaseResult<T>> {
    this.databaseResult = await this.executeDatabaseQuery(context)
    return this.databaseResult
  }

  protected abstract executeDatabaseQuery(
    context: StateContext
  ): Promise<CollectionModelDatabaseResult<T>>

  public addSelfLink(pagingContext: PagingContext): void {
    this._pagingBehaviour.addSelfLink(pagingContext)
  }

  public addPrevPageLink(pagingContext: PagingContext): void {
    this._pagingBehaviour.addPrevPageLink(pagingContext)
  }

  public addNextPageLink(pagingContext: PagingContext): void {
    this._pagingBehaviour.addNextPageLink(pagingContext, this.databaseResult)
  }

  public addPageHeader(pagingContext: PagingContext): void {
    this._pagingBehaviour.addPageHeader(pagingContext, this.databaseResult)
  }

  public get offset(): number {
    return this._pagingBehaviour.offset
  }

  public get size(): number {
    return this._pagingBehaviour.size
  }
}
