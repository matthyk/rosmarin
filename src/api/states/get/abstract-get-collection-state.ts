import { AbstractModel } from '../../abstract-model'
import { AbstractState } from '../abstract-state'
import { CollectionModelDatabaseResult } from '../../../database/results/collection-model-database-result'
import { HttpResponse } from '../../../router/http-response'
import { CacheControl } from '../../caching/cache-control'
import { PagingContext } from '../../filter/paging-context'
import { AbstractFilter } from '../../filter/abstract-filter'
import { FastifyRequest } from 'fastify'
import { ModelId } from '../../types'

export abstract class AbstractGetCollectionState<
  T extends AbstractModel
> extends AbstractState {
  public static readonly HEADER_TOTALNUMBEROFRESULTS = 'X-totalnumberofresults'

  public static readonly HEADER_NUMBEROFRESULTS = 'X-numberofresults'

  protected req: FastifyRequest<{
    Body: never
    Params: { id: number | string }
  }>

  protected requestedId: ModelId

  protected databaseResult: CollectionModelDatabaseResult<T>

  protected query: AbstractFilter<T>

  protected async buildInternal(): Promise<HttpResponse> {
    this.configureState()

    this.logger.debug('Start of processing collection state')

    if ((await this.verifyApiKey()) === false) {
      return this.response.apiKeyRequired()
    }
    if ((await this.verifyRolesOfClient()) === false) {
      return this.response.unauthorized()
    }

    this.databaseResult = await this.loadModelsFromDatabase()

    if (this.databaseResult.hasError()) {
      return this.response.internalServerError()
    }

    if ((await this.verifyAllStateEntryConstraints()) === false) {
      return this.response.forbidden()
    }

    return await this.createResponse()
  }

  protected abstract loadModelsFromDatabase(): Promise<
    CollectionModelDatabaseResult<T>
  >

  protected async createResponse(): Promise<HttpResponse> {
    this.defineHttpHeaderTotalNumberOfResults()

    this.defineHttpHeaderNumberOfResults()

    this.defineHttpResponseBody()

    this.defineHttpCaching()

    this.defineSelfLink()

    this.definePagingLinks()

    this.defineTransitionLinks()

    this.defineAuthenticationResponseHeaders()

    return this.response
  }

  protected defineHttpHeaderTotalNumberOfResults(): void {
    this.response.header(
      this.getHeaderForTotalNumberOfResults(),
      this.databaseResult.totalNumberOfResult
    )
  }

  protected defineHttpHeaderNumberOfResults(): void {
    this.response.header(
      this.getHeaderForNumberOfResults(),
      this.databaseResult.databaseResult.length
    )
  }

  protected defineHttpResponseBody(): void {
    this.response.entity = this.convertModelsToViews(
      this.databaseResult.databaseResult
    )
  }

  protected defineHttpCaching(): void {
    const cacheControl: CacheControl = new CacheControl()

    cacheControl.noStore = true
    cacheControl.noCache = true

    this.response.cacheControl(cacheControl)
  }

  protected abstract defineTransitionLinks(): Promise<void> | void

  protected extractFromRequest(): void {
    this.requestedId = this.req.params.id
  }

  protected definePagingLinks(): void {
    const pagingContext: PagingContext = this.createPagingContext()

    this.query.addNextPageLink(pagingContext)
    this.query.addPrevPageLink(pagingContext)
    this.query.addPageHeader(pagingContext)
  }

  protected defineSelfLink(): void {
    this.query.addSelfLink(this.createPagingContext())
  }

  /**
   * Override this method to change the header name value
   */
  protected getHeaderForTotalNumberOfResults(): string {
    return AbstractGetCollectionState.HEADER_TOTALNUMBEROFRESULTS
  }

  protected getHeaderForNumberOfResults(): string {
    return AbstractGetCollectionState.HEADER_TOTALNUMBEROFRESULTS
  }

  protected convertModelsToViews(models: T[]): T[] {
    return models.map((m: T) => <T>this.convertModelToView(m)) // TODO
  }

  private createPagingContext(): PagingContext {
    return new PagingContext(
      this.req,
      this.response,
      this.getAcceptedMediaType()
    )
  }
}
