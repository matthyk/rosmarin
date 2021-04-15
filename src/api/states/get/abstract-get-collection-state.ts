import { AbstractModel, ModelId } from '../../../models'
import { AbstractState } from '../abstract-state'
import { CollectionModelDatabaseResult } from '../../../database'
import { HttpResponse } from '../../../router/http-response'
import { CacheControl } from '../../caching'
import { FastifyRequest } from 'fastify'
import { AbstractPagingBehaviour } from '../../pagination'

export abstract class AbstractGetCollectionState<
  T extends AbstractModel
> extends AbstractState {
  public static readonly HEADER_TOTALNUMBEROFRESULTS = 'X-totalnumberofresults'

  public static readonly HEADER_NUMBEROFRESULTS = 'X-numberofresults'

  protected req: FastifyRequest<{ Body: never }>

  protected requestedId: ModelId

  protected databaseResult: CollectionModelDatabaseResult<T>

  protected pagingBehaviour: AbstractPagingBehaviour

  protected async buildInternal(): Promise<HttpResponse> {
    this.configureState()

    this.extractFromRequest()

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

    this.pagingBehaviour = this.definePagingBehaviour()

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
    this.response.entity = this.convertLinks(this.databaseResult.databaseResult)
  }

  protected defineHttpCaching(): void {
    const cacheControl: CacheControl = new CacheControl()

    cacheControl.noStore = true
    cacheControl.noCache = true

    this.response.cacheControl(cacheControl)
  }

  protected abstract defineTransitionLinks(): Promise<void> | void

  protected extractFromRequest(): void {}

  protected abstract definePagingBehaviour(): AbstractPagingBehaviour

  protected definePagingLinks(): void {
    this.pagingBehaviour.build(this.response)
  }

  /**
   * Override this method to change the header name value
   */
  protected getHeaderForTotalNumberOfResults(): string {
    return AbstractGetCollectionState.HEADER_TOTALNUMBEROFRESULTS
  }

  /**
   * Override this method to change the header name value
   */
  protected getHeaderForNumberOfResults(): string {
    return AbstractGetCollectionState.HEADER_NUMBEROFRESULTS
  }
}
