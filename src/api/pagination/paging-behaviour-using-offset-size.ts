import { AbstractPagingBehaviour } from './abstract-paging-behaviour'
import { URL } from 'url'
import { linkHeader } from '../links'
import RelationTypes from '../relation-types'

export class PagingBehaviourUsingOffsetSize extends AbstractPagingBehaviour {
  public static readonly QUERY_PARAM_SIZE = 'size'

  public static readonly QUERY_PARAM_OFFSET = 'offset'

  public static readonly DEFAULT_PAGE_SIZE = 10

  constructor(
    fullUrl: string,
    protected readonly totalNumberOfResults: number,
    protected readonly offset: number,
    protected readonly size: number,
    type: string,
    protected readonly defaultPageSize = PagingBehaviourUsingOffsetSize.DEFAULT_PAGE_SIZE
  ) {
    super(fullUrl, type)
  }

  protected hasFirstPage(): boolean {
    return this.offset - this.size > 0
  }

  protected hasLastPage(): boolean {
    return this.currentOffsetPlusTwoPages() < this.totalNumberOfResults
  }

  protected hasNextPage(): boolean {
    return this.offset + this.size < this.totalNumberOfResults
  }

  protected hasPreviousPage(): boolean {
    return this.offset > 0
  }

  protected getFirstPageLink(): string {
    const url: URL = new URL(this.fullUrl)

    url.searchParams.set('offset', '0')
    url.searchParams.set('size', this.getFirstLinkSize())

    return linkHeader(url.toString(), RelationTypes.first, this.type)
  }

  protected getLastPageLink(): string {
    const url: URL = new URL(this.fullUrl)

    url.searchParams.set('offset', this.getLastLinkOffset())
    url.searchParams.set('size', this.getLastLinkSize())

    return linkHeader(url.toString(), RelationTypes.last, this.type)
  }

  protected getPrevPageLink(): string {
    const url: URL = new URL(this.fullUrl)

    url.searchParams.set(
      PagingBehaviourUsingOffsetSize.QUERY_PARAM_OFFSET,
      this.getPreviousLinkOffset()
    )
    url.searchParams.set(
      PagingBehaviourUsingOffsetSize.QUERY_PARAM_SIZE,
      this.getPreviousLinkSize()
    )

    return linkHeader(url.toString(), RelationTypes.prev, this.type)
  }

  protected getNextPageLink(): string {
    const url: URL = new URL(this.fullUrl)

    url.searchParams.set(
      PagingBehaviourUsingOffsetSize.QUERY_PARAM_OFFSET,
      this.getNextLinkOffset()
    )

    url.searchParams.set(
      PagingBehaviourUsingOffsetSize.QUERY_PARAM_SIZE,
      this.getNextLinkSize()
    )

    return linkHeader(url.toString(), RelationTypes.next, this.type)
  }

  private getLastLinkSize(): string {
    return Math.min(
      this.size,
      this.totalNumberOfResults - +this.getNextLinkOffset() - this.size
    ).toString()
  }

  private getLastLinkOffset(): string {
    return Math.max(
      this.currentOffsetPlusTwoPages(),
      this.totalNumberOfResults - this.size
    ).toString()
  }

  private currentOffsetPlusTwoPages() {
    return this.offset + this.size * 2
  }

  private getFirstLinkSize(): string {
    return Math.min(this.size, this.offset - this.size).toString()
  }

  private getPreviousLinkSize(): string {
    return Math.min(this.defaultPageSize, this.size).toString()
  }

  private getPreviousLinkOffset(): string {
    return Math.max(0, this.offset - this.size).toString()
  }

  private getNextLinkSize(): string {
    return Math.min(this.defaultPageSize, this.size).toString()
  }

  private getNextLinkOffset(): string {
    return Math.min(
      this.totalNumberOfResults - 1,
      this.offset + this.size
    ).toString()
  }
}
