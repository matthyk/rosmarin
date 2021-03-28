import { CollectionModelDatabaseResult } from '../../database/results/collection-model-database-result'
import { PagingContext } from './paging-context'

export interface IPagingBehaviour {
  addSelfLink(pagingContext: PagingContext): void

  addPrevPageLink(pagingContext: PagingContext): void

  addNextPageLink(
    pagingContext: PagingContext,
    databaseResult: CollectionModelDatabaseResult
  ): void

  addPageHeader(
    pagingContext: PagingContext,
    databaseResult: CollectionModelDatabaseResult
  ): void

  offset: number

  size: number
}
