import { AbstractModel } from '../../abstract-model'
import { ViewModel } from '../../abstract-view-model'
import { SingleModelDatabaseResult } from '../../../database/results/single-model-database-result'
import { NoContentDatabaseResult } from '../../../database/results/no-content-database-result'
import { HttpResponse } from '../../../router/http-response'
import { AbstractStateWithCaching } from '../abstract-state-with-caching'
import { linkHeader } from '../hyperlinks'
import RelationTypes from '../relation-types'
import { merge } from '../../views/view-merger/merge'
import { FastifyRequest } from 'fastify'
import { ModelId } from '../../types'

export abstract class AbstractPutState<
  T extends AbstractModel,
  V extends ViewModel
> extends AbstractStateWithCaching {
  protected modelToUpdate: V

  protected dbResultAfterGet: SingleModelDatabaseResult<T>

  protected modelInDatabase: T

  protected modelForConstraintCheck: AbstractModel

  protected dbResultAfterUpdate: NoContentDatabaseResult

  protected responseStatus200 = true

  protected usingPutToCreateAllowed = false

  protected req: FastifyRequest<{ Body: V; Params: { id: ModelId } }>

  protected updatedId: ModelId

  protected async buildInternal(): Promise<HttpResponse> {
    this.configureState()

    this.extractFromRequest()

    if ((await this.verifyApiKey()) === false) {
      return this.response.unauthorized('API key required.')
    }

    if ((await this.verifyRolesOfClient()) === false) {
      return this.response.unauthorized('You have no power here!')
    }

    this.dbResultAfterGet = await this.loadModelFromDatabase()

    this.modelInDatabase = this.dbResultAfterGet.result

    if (
      this.dbResultAfterGet.isEmpty() &&
      this.usingPutToCreateAllowed === false
    ) {
      return this.response.notFound()
    }

    this.modelForConstraintCheck = this.modelToUpdate

    if ((await this.verifyAllStateEntryConstraints()) === false) {
      return this.response.forbidden()
    }

    if (this.clientKnowsCurrentModelState() === false) {
      return this.response.preconditionFailed()
    }

    this.mergeViewModelIntoDatabaseModel()

    this.dbResultAfterUpdate = await this.updateModelInDatabase()

    if (this.dbResultAfterUpdate.hasError()) {
      return this.response.internalServerError()
    }

    this.modelForConstraintCheck = this.modelInDatabase

    return await this.createResponse()
  }

  protected abstract loadModelFromDatabase(): Promise<
    SingleModelDatabaseResult<T>
  >

  protected extractFromRequest(): void {
    this.modelToUpdate = this.req.body
    this.updatedId = this.req.params.id
  }

  protected clientKnowsCurrentModelState(): boolean {
    const currentEtag: string = this.createEntityTagOfResult(
      this.dbResultAfterGet.result
    )
    const lastModifiedAt: number = this.dbResultAfterGet.result.lastModifiedAt

    return this.req.evaluateConditionalPutRequest(lastModifiedAt, currentEtag)
  }

  private mergeViewModelIntoDatabaseModel(): void {
    this.modelInDatabase = merge(this.modelToUpdate, this.modelInDatabase)
  }

  protected abstract updateModelInDatabase(): Promise<NoContentDatabaseResult>

  protected async createResponse(): Promise<HttpResponse> {
    this.defineResponseStatus()

    this.defineModelForCaching(this.modelInDatabase)

    this.defineHttpCaching()

    this.defineHttpResponseBody()

    this.defineSelfLink()

    await this.defineTransitionLinks()

    return this.response
  }

  protected abstract defineTransitionLinks(): Promise<void> | void

  private defineResponseStatus(): void {
    this.responseStatus200 ? this.response.ok() : this.response.noContent()
  }

  protected defineHttpResponseBody(): void {
    if (this.responseStatus200) {
      this.response.entity = this.convertModelToView(this.modelInDatabase)
    }
  }

  protected defineSelfLink(): void {
    this.response.link(
      linkHeader(
        this.req.fullUrl(),
        RelationTypes.self,
        this.getAcceptedMediaType()
      )
    )
  }
}
