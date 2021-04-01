import { IPagingBehaviour } from './interface-paging-behaviour'
import { PagingContext } from './paging-context'
import { CollectionModelDatabaseResult } from '../../database/results/collection-model-database-result'
import { buildLink } from '../states/hyperlinks'
import { FastifyRequest } from 'fastify'
import { URL } from 'url'
import RelationTypes from '../states/relation-types'

export class PagingBehaviourUsingOffsetSize implements IPagingBehaviour {
  public static readonly DEFAULT_PAGE_SIZE = 10

  public static readonly QUERY_PARAM_SIZE = 'size'

  public static readonly QUERY_PARAM_OFFSET = 'offset'

  private _offset: number

  private _size: number

  protected offsetQueryParamName: string =
    PagingBehaviourUsingOffsetSize.QUERY_PARAM_OFFSET

  protected sizeQueryParamName: string =
    PagingBehaviourUsingOffsetSize.QUERY_PARAM_SIZE

  public get offset(): number {
    return this._offset
  }

  public set offset(value: number) {
    this._offset = Math.max(0, value)
  }

  public get size(): number {
    return this._size
  }

  public set size(value: number) {
    this._size = Math.max(1, value)
  }

  constructor()
  constructor(offsetQueryParamName: string, sizeQueryParamName: string)
  constructor(offset: number, size: number)
  constructor(
    offsetQueryParamName: string,
    sizeQueryParamName: string,
    offset: number,
    size: number
  )
  constructor(
    offsetQueryParamNameOrOffset?: string | number,
    sizeQueryParamNameOrSize?: string | number,
    offset?: number,
    size?: number
  ) {
    if (
      typeof offsetQueryParamNameOrOffset === 'string' &&
      typeof sizeQueryParamNameOrSize === 'string'
    ) {
      if (typeof offset === 'number' && typeof size === 'number') {
        this.sizeQueryParamName = sizeQueryParamNameOrSize
        this.offsetQueryParamName = offsetQueryParamNameOrOffset
        this.offset = offset
        this.size = size
      } else {
        this.sizeQueryParamName = sizeQueryParamNameOrSize
        this.offsetQueryParamName = offsetQueryParamNameOrOffset
      }
    } else if (
      typeof offsetQueryParamNameOrOffset === 'number' &&
      typeof sizeQueryParamNameOrSize === 'number'
    ) {
      this.offset = offsetQueryParamNameOrOffset
      this.size = sizeQueryParamNameOrSize
    }
  }

  public addNextPageLink(
    pagingContext: PagingContext,
    databaseResult: CollectionModelDatabaseResult
  ): void {
    if (this.hasNextLink(databaseResult)) {
      const link: string = buildLink(
        this.getNextUri(pagingContext.req, databaseResult).toString(),
        RelationTypes.next,
        pagingContext.mediaType
      )

      pagingContext.response.link(link)
    }
  }

  public addPageHeader(
    _pagingContext: PagingContext,
    _databaseResult: CollectionModelDatabaseResult
  ): void {
    // not implemented
  }

  public addPrevPageLink(pagingContext: PagingContext): void {
    if (this.hasPrevLink()) {
      const link: string = buildLink(
        this.getPrevUri(pagingContext.req).toString(),
        RelationTypes.prev,
        pagingContext.mediaType
      )

      pagingContext.response.link(link)
    }
  }

  public addSelfLink(pagingContext: PagingContext): void {
    const link: string = buildLink(
      this.getSelfUri(pagingContext.req).toString(),
      RelationTypes.self,
      pagingContext.mediaType
    )

    pagingContext.response.link(link)
  }

  private getSelfUri(req: FastifyRequest): URL {
    const url: URL = new URL(req.fullUrl())

    url.searchParams.set(this.sizeQueryParamName, this.size.toString())
    url.searchParams.set(this.offsetQueryParamName, this.offset.toString())

    return url
  }

  private hasPrevLink(): boolean {
    return this._offset > 0
  }

  private hasNextLink(dbResult: CollectionModelDatabaseResult): boolean {
    return this._offset + this._size < dbResult.totalNumberOfResult
  }

  private getPrevUri(req: FastifyRequest): URL {
    const url: URL = new URL(req.fullUrl())

    url.searchParams.set(
      this.offsetQueryParamName,
      Math.max(this._offset - this._size, 0).toString()
    )
    url.searchParams.set(
      this.sizeQueryParamName,
      Math.min(this._size, this.getDefaultPageSize()).toString()
    )

    return url
  }

  private getNextUri(
    req: FastifyRequest,
    dbResult: CollectionModelDatabaseResult
  ): URL {
    const url: URL = new URL(req.fullUrl())

    url.searchParams.set(
      this.offsetQueryParamName,
      Math.min(
        this._offset + this._size,
        dbResult.totalNumberOfResult - 1
      ).toString()
    )
    url.searchParams.set(
      this.sizeQueryParamName,
      Math.min(this._size, this.getDefaultPageSize()).toString()
    )

    return url
  }

  /**
   * can be overridden by sub-classes to define different default page size
   */
  protected getDefaultPageSize(): number {
    return PagingBehaviourUsingOffsetSize.DEFAULT_PAGE_SIZE
  }
}
