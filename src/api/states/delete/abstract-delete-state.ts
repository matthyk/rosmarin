import { AbstractModel } from '../../abstract-model'
import { AbstractState } from '../abstract-state'
import { ModelId } from '../../types'
import { SingleModelDatabaseResult } from '../../../database/results/single-model-database-result'
import { NoContentDatabaseResult } from '../../../database/results/no-content-database-result'
import { HttpResponse } from '../../../routing/http-response'
import { createEtag } from '../../caching/etag-generator'

export abstract class AbstractDeleteState<
  T extends AbstractModel
> extends AbstractState {
  protected _modelIdToDelete: ModelId

  protected _modelForConstraintCheck: AbstractModel

  protected _dbResultAfterGet: SingleModelDatabaseResult<T>

  protected _dbResultAfterDelete: NoContentDatabaseResult

  protected _responseStatus200 = false

  public get modelIdToDelete(): ModelId {
    return this._modelIdToDelete
  }

  public set modelIdToDelete(value: ModelId) {
    this._modelIdToDelete = value
  }

  public get modelForConstraintCheck(): AbstractModel {
    return this._modelForConstraintCheck
  }

  public set modelForConstraintCheck(value: AbstractModel) {
    this._modelForConstraintCheck = value
  }

  public get dbResultAfterGet(): SingleModelDatabaseResult<T> {
    return this._dbResultAfterGet
  }

  public set dbResultAfterGet(value: SingleModelDatabaseResult<T>) {
    this._dbResultAfterGet = value
  }

  public get dbResultAfterDelete(): NoContentDatabaseResult {
    return this._dbResultAfterDelete
  }

  public set dbResultAfterDelete(value: NoContentDatabaseResult) {
    this._dbResultAfterDelete = value
  }

  public get responseStatus200(): boolean {
    return this._responseStatus200
  }

  public set responseStatus200(value: boolean) {
    this._responseStatus200 = value
  }

  protected async buildInternal(): Promise<HttpResponse> {
    this.configureState()

    if ((await this.verifyApiKey()) === false) {
      return this.response.unauthorized('API key required.')
    }

    if ((await this.verifyRolesOfClient()) === false) {
      return this.response.unauthorized('You have no power here!')
    }

    // locking

    this._dbResultAfterGet = await this.loadModelFromDatabase()

    if (this._dbResultAfterGet.isEmpty()) {
      return this.response.notFound()
    }

    this._modelForConstraintCheck = this._dbResultAfterGet.result

    if ((await this.verifyAllStateEntryConstraints()) === false) {
      return this.response.forbidden()
    }

    if (this.clientKnowsCurrentModelState() === false) {
      return this.response.preconditionFailed()
    }

    this._dbResultAfterDelete = await this.deleteModelInDatabase()

    if (this._dbResultAfterDelete.hasError()) {
      return this.response.internalServerError()
    }

    return this.createResponse()
  }

  protected abstract loadModelFromDatabase(): Promise<
    SingleModelDatabaseResult<T>
  >

  protected clientKnowsCurrentModelState(): boolean {
    const currentEtag: string = this.createEntityTagOfResult()
    const lastModifiedAt: number = this._dbResultAfterGet.result.lastModifiedAt

    return this._req.evaluatePreconditions(lastModifiedAt, currentEtag)
  }

  private createEntityTagOfResult(): string {
    return createEtag(this._dbResultAfterGet.result)
  }

  protected abstract deleteModelInDatabase(): Promise<NoContentDatabaseResult>

  protected async createResponse(): Promise<HttpResponse> {
    this.defineResponseStatus()

    this.defineHttpResponseBody()

    await this.defineTransitionLinks()

    return this.response
  }

  private defineResponseStatus(): void {
    this._responseStatus200 ? this.response.ok() : this.response.noContent()
  }

  private defineHttpResponseBody(): void {
    if (this._responseStatus200) {
      this.response.entity = this.convertModelToView(
        this._dbResultAfterGet.result
      )
    }
  }

  protected abstract defineTransitionLinks(): Promise<void> | void
}
