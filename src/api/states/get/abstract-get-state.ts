import { AbstractModel } from '../../abstract-model'
import { AbstractStateWithCaching } from '../abstract-state-with-caching'
import { HttpResponse } from '../../../routing/http-response'
import { SingleModelDatabaseResult } from '../../../database/results/single-model-database-result'
import { linkHeader } from '../hyperlinks'
import RelationTypes from '../relation-types'
import { Converter } from '../../views/view-converter'

export abstract class AbstractGetState<
  T extends AbstractModel
> extends AbstractStateWithCaching {
  public constructor() {
    super()
  }

  private _requestedId: number

  private _modelForConstraintCheck: AbstractModel

  private _requestedModel: SingleModelDatabaseResult<T>

  private _converter: Converter<T>

  public get requestedId(): number {
    return this._requestedId
  }

  public set requestedId(value: number) {
    this._requestedId = value
  }

  public get modelForConstraintCheck(): AbstractModel {
    return this._modelForConstraintCheck
  }

  public set modelForConstraintCheck(value: AbstractModel) {
    this._modelForConstraintCheck = value
  }

  public get requestedModel(): SingleModelDatabaseResult<T> {
    return this._requestedModel
  }

  public set requestedModel(value: SingleModelDatabaseResult<T>) {
    this._requestedModel = value
  }

  public set converter(value: Converter<T>) {
    this._converter = value
  }

  protected async buildInternal(): Promise<HttpResponse> {
    this.configureState()

    if ((await this.verifyApiKey()) === false) {
      return this.response.unauthorized('API key required.')
    }

    if ((await this.verifyRolesOfClient()) === false) {
      return this.response.unauthorized('You have no power here!')
    }

    this._requestedModel = await this.loadModelFromDatabase()

    if (this._requestedModel.hasError()) {
      return this.response.internalServerError()
    }

    if (this._requestedModel.isEmpty()) {
      // TODO provide user the possibility to throw custom error
      return this.response.notFound('This resource does not exist.')
    }

    this._modelForConstraintCheck = this._requestedModel.result

    if ((await this.verifyAllStateEntryConstraints()) === false) {
      return this.response.forbidden('You have no power here!')
    }

    if (this.clientKnowsCurrentModelState()) {
      return this.response.notModified()
      // TODO: set headers
      // TODO: Question: Should links be sent too?
    }

    return await this.createResponse()
  }

  protected async createResponse(): Promise<HttpResponse> {
    this.defineHttpResponseBody()

    this.defineModelForCaching(this._requestedModel.result)

    this.defineHttpCaching()

    this.defineSelfLink()

    await this.defineTransitionLinks()

    this.defineAuthenticationResponseHeaders()

    return this.response.ok()
  }

  protected defineHttpResponseBody(): void {
    if (this._converter) {
      this.response.entity = this._converter(this._requestedModel.result)
    } else {
      this.response.entity = this._requestedModel.result
    }
  }

  protected abstract defineTransitionLinks(): Promise<void> | void

  protected abstract loadModelFromDatabase(): Promise<
    SingleModelDatabaseResult<T>
  >

  protected evaluatePreconditions(
    etag: string,
    lastModifiedAt: number
  ): boolean {
    return (
      etag === this._req.headers['if-none-match'] ||
      new Date(this._req.headers['if-modified-since']).getTime() >
        lastModifiedAt
    )
  }

  protected clientKnowsCurrentModelState(): boolean {
    const currentEtag: string = this.createEntityTagOfResult(
      this._requestedModel.result
    )

    return this.evaluatePreconditions(
      currentEtag,
      this._requestedModel.result.lastModifiedAt
    )
  }

  protected defineSelfLink(): void {
    this.response.link(
      linkHeader(
        this._req.fullUrl,
        RelationTypes.self,
        this.getAcceptedMediaType()
      )
    )
  }
}
