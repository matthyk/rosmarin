import { HttpResponse } from '../../router/http-response'
import { linkHeader } from '../links'
import RelationTypes from '../relation-types'

export abstract class AbstractPagingBehaviour {
  protected constructor(
    protected readonly fullUrl: string,
    protected readonly type: string
  ) {}

  protected abstract hasPreviousPage(): boolean

  protected abstract hasNextPage(): boolean

  protected abstract hasLastPage(): boolean

  protected abstract hasFirstPage(): boolean

  protected abstract getFirstPageLink(): string

  protected abstract getLastPageLink(): string

  protected abstract getPrevPageLink(): string

  protected abstract getNextPageLink(): string

  protected getSelfLink(): string {
    return linkHeader(this.fullUrl, RelationTypes.self, this.type)
  }

  public build(response: HttpResponse): void {
    response.link(this.getSelfLink())

    if (this.hasPreviousPage()) response.link(this.getPrevPageLink())

    if (this.hasNextPage()) response.link(this.getNextPageLink())

    if (this.hasLastPage()) response.link(this.getLastPageLink())

    if (this.hasFirstPage()) response.link(this.getFirstPageLink())
  }
}
