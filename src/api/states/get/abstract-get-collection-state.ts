import { AbstractModel } from '../../abstract-model'
import { AbstractState } from '../abstract-state'
import { CollectionModelDatabaseResult } from '../../../database/results/collection-model-database-result'
import { HttpResponse } from '../../../routing/http-response'
import { CacheControl } from "../../caching/cache-control";
import { PagingContext } from "../../filter/paging-context";
import { AbstractFilter } from "../../filter/abstract-filter";

export abstract class AbstractGetCollectionState<
  T extends AbstractModel
> extends AbstractState {

  public static readonly HEADER_TOTALNUMBEROFRESULTS = 'X-totalnumberofresults'

  public static readonly HEADER_NUMBEROFRESULTS = 'X-numberofresults'

  protected _databaseResult: CollectionModelDatabaseResult<T>

  private _query: AbstractFilter<T>

  protected pagingContext: PagingContext

  public set query(value: AbstractFilter<T>) {
    this._query = value;
  }

  public get query(): AbstractFilter<T> {
    return this._query;
  }

  public set databaseResult(value: CollectionModelDatabaseResult<T>) {
    this._databaseResult = value;
  }

  public get databaseResult(): CollectionModelDatabaseResult<T> {
    return this._databaseResult;
  }

  protected async buildInternal(): Promise<HttpResponse> {
    this.configureState()

    this.logger.debug('Start of processing collection state')

    if ((await this.verifyApiKey()) === false) {
      return this.response.apiKeyRequired()
    }
    if (await this.verifyRolesOfClient()) {
      return this.response.unauthorized()
    }

    this._databaseResult = await this.loadModelsFromDatabase()

    if (this._databaseResult.hasError()) {
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
    this.response.header(this.getHeaderForTotalNumberOfResults(), this._databaseResult.totalNumberOfResult)
  }

  protected defineHttpHeaderNumberOfResults(): void {
    this.response.header(this.getHeaderForNumberOfResults(), this._databaseResult.databaseResult.length)
  }

  protected defineHttpResponseBody(): void {
    this.response.entity = this.convertModelsToViews(this._databaseResult.databaseResult)
  }

  protected defineHttpCaching(): void {
    const cacheControl: CacheControl = new CacheControl()

    cacheControl.noStore = true
    cacheControl.noCache = true

    this.response.cacheControl(cacheControl)
  }

  protected abstract defineTransitionLinks(): Promise<void> | void

  protected definePagingLinks(): void {
    const pagingContext: PagingContext = this.createPagingContext()

    this._query.addNextPageLink(pagingContext)
    this._query.addPrevPageLink(pagingContext)
    this._query.addPageHeader(pagingContext)
  }

  protected defineSelfLink(): void {
    this._query.addSelfLink(this.createPagingContext())
  }

  /**
   * Override this method so change the header name value
   */
  protected getHeaderForTotalNumberOfResults(): string {
    return AbstractGetCollectionState.HEADER_TOTALNUMBEROFRESULTS
  }

  protected getHeaderForNumberOfResults(): string {
    return AbstractGetCollectionState.HEADER_NUMBEROFRESULTS
  }

  protected convertModelsToViews(models: T[]): T[] {
    return models.map((m: T) => this.convertModelToView(m) as T) // TODO
  }

  private createPagingContext(): PagingContext {
    return new PagingContext(this._req, this.response, this.getAcceptedMediaType())
  }
}
