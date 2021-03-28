import { AbstractModel } from '../../abstract-model'
import { ViewModel } from '../../abstract-view-model'
import { SingleModelDatabaseResult } from '../../../database/results/single-model-database-result'
import { NoContentDatabaseResult } from '../../../database/results/no-content-database-result'
import { HttpResponse } from '../../../routing/http-response'
import { AbstractStateWithCaching } from '../abstract-state-with-caching'
import { linkHeader } from '../hyperlinks'
import RelationTypes from '../relation-types'

export abstract class AbstractPutState<
  T extends AbstractModel,
  V extends ViewModel
> extends AbstractStateWithCaching {
  protected _modelToUpdate: V

  protected _dbResultAfterGet: SingleModelDatabaseResult<T>

  protected _modelInDatabase: T

  protected _modelForConstraintCheck: AbstractModel

  protected _dbResultAfterUpdate: NoContentDatabaseResult

  protected _responseStatus200 = true

  protected _usingPutToCreateAllowed = false

  public get modelToUpdate(): V {
    return this._modelToUpdate
  }

  public set modelToUpdate(value: V) {
    this._modelToUpdate = value
  }

  public get dbResultAfterGet(): SingleModelDatabaseResult<T> {
    return this._dbResultAfterGet
  }

  public set dbResultAfterGet(value: SingleModelDatabaseResult<T>) {
    this._dbResultAfterGet = value
  }

  public get modelInDatabase(): T {
    return this._modelInDatabase
  }

  public set modelInDatabase(value: T) {
    this._modelInDatabase = value
  }

  public get modelForConstraintCheck(): AbstractModel {
    return this._modelForConstraintCheck
  }

  public set modelForConstraintCheck(value: AbstractModel) {
    this._modelForConstraintCheck = value
  }

  public get dbResultAfterUpdate(): NoContentDatabaseResult {
    return this._dbResultAfterUpdate
  }

  public set dbResultAfterUpdate(value: NoContentDatabaseResult) {
    this._dbResultAfterUpdate = value
  }

  public get responseStatus200(): boolean {
    return this._responseStatus200
  }

  public set responseStatus200(value: boolean) {
    this._responseStatus200 = value
  }

  public get usingPutToCreateAllowed(): boolean {
    return this._usingPutToCreateAllowed
  }

  public set usingPutToCreateAllowed(value: boolean) {
    this._usingPutToCreateAllowed = value
  }

  protected async buildInternal(): Promise<HttpResponse> {
    this.configureState()

    if ((await this.verifyApiKey()) === false) {
      return this.response.unauthorized('API key required.')
    }

    if ((await this.verifyRolesOfClient()) === false) {
      return this.response.unauthorized('You have no power here!')
    }

    this._dbResultAfterGet = await this.loadModelFromDatabase()

    this._modelInDatabase = this._dbResultAfterGet.result

    if (
      this._dbResultAfterGet.isEmpty() &&
      this._usingPutToCreateAllowed === false
    ) {
      return this.response.notFound()
    }

    this._modelForConstraintCheck = this._modelToUpdate

    if ((await this.verifyAllStateEntryConstraints()) === false) {
      return this.response.forbidden()
    }

    if (this.clientKnowsCurrentModelState() === false) {
      return this.response.preconditionFailed()
    }

    this.mergeViewModelIntoDatabaseModel()

    this._dbResultAfterUpdate = await this.updateModelInDatabase()

    if (this._dbResultAfterUpdate.hasError()) {
      return this.response.internalServerError()
    }

    this._modelForConstraintCheck = this._modelInDatabase

    return await this.createResponse()
  }

  protected abstract loadModelFromDatabase(): Promise<
    SingleModelDatabaseResult<T>
  >

  protected clientKnowsCurrentModelState(): boolean {
    const currentEtag: string = this.createEntityTagOfResult(
      this._dbResultAfterGet.result
    )
    const lastModifiedAt: number = this._dbResultAfterGet.result.lastModifiedAt

    return this._req.evaluatePreconditions(lastModifiedAt, currentEtag)
  }

  private mergeViewModelIntoDatabaseModel(): void {
    // TODO
  }

  protected abstract updateModelInDatabase(): Promise<NoContentDatabaseResult>

  protected async createResponse(): Promise<HttpResponse> {
    this.defineResponseStatus()

    this.defineModelForCaching(this._modelInDatabase)

    this.defineHttpCaching()

    this.defineHttpResponseBody()

    this.defineSelfLink()

    await this.defineTransitionLinks()

    return this.response
  }

  protected abstract defineTransitionLinks(): Promise<void> | void

  private defineResponseStatus(): void {
    this._responseStatus200 ? this.response.ok() : this.response.noContent()
  }

  protected defineHttpResponseBody(): void {
    if (this._responseStatus200) {
      this.response.entity = this.convertModelToView(this._modelInDatabase)
    }
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
