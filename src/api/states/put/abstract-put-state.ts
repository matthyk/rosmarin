import { AbstractModel, AbstractViewModel, ModelId } from '../../../models'
import {
  NoContentDatabaseResult,
  SingleModelDatabaseResult,
} from '../../../database'
import { HttpResponse } from '../../../router'
import { AbstractStateWithCaching } from '../abstract-state-with-caching'
import { linkHeader } from '../../links'
import RelationTypes from '../../relation-types'
import { merge } from '../../views'
import { FastifyRequest } from 'fastify'

export abstract class AbstractPutState<
  T extends AbstractModel,
  V extends AbstractViewModel
> extends AbstractStateWithCaching {
  protected modelToUpdate: V

  protected dbResultAfterGet: SingleModelDatabaseResult<T>

  protected modelInDatabase: T

  protected modelForConstraintCheck: AbstractModel

  protected dbResultAfterUpdate: NoContentDatabaseResult

  protected responseStatus200 = true

  protected usingPutToCreateAllowed = false

  protected req: FastifyRequest<{ Body: V }>

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

    await this.beforeLoadingModelFromDatabase()

    this.dbResultAfterGet = await this.loadModelFromDatabase()

    await this.afterLoadingModelFromDatabase()

    this.modelInDatabase = this.dbResultAfterGet.result

    if (
      this.dbResultAfterGet.isEmpty() &&
      this.usingPutToCreateAllowed === false
    ) {
      return this.response.notFound()
    }

    this.modelForConstraintCheck = this.modelToUpdate

    await this.verifyAllStateEntryConstraints()

    if ((await this.verifyAllStateEntryConstraints()) === false) {
      return this.response.forbidden()
    }

    await this.afterVerifyingStateEntryConstraints()

    if (this.clientKnowsCurrentModelState() === false) {
      return this.response.preconditionFailed()
    }

    await this.beforeMergeNewModelWithDatabaseModel()

    this.mergeViewModelIntoDatabaseModel()

    await this.afterMergeNewModelWithDatabaseModel()

    await this.beforeUpdatingModelInDatabase()

    this.dbResultAfterUpdate = await this.updateModelInDatabase()

    if (this.dbResultAfterUpdate.hasError()) {
      return this.response.internalServerError()
    }

    await this.afterModelHasBeenUpdatedInDatabase()

    this.modelForConstraintCheck = this.modelInDatabase

    await this.beforeCreatingResponse()

    return await this.createResponse()
  }

  protected abstract loadModelFromDatabase(): Promise<
    SingleModelDatabaseResult<T>
  >

  protected extractFromRequest(): void {
    this.modelToUpdate = this.req.body
    this.updatedId = this.extractFromParams('id')
  }

  protected clientKnowsCurrentModelState(): boolean {
    const currentEtag: string = this.createEntityTagOfResult(
      this.dbResultAfterGet.result
    )
    const lastModifiedAt: number = this.dbResultAfterGet.result.lastModifiedAt

    return this.req.evaluateConditionalPutRequest(lastModifiedAt, currentEtag)
  }

  private mergeViewModelIntoDatabaseModel(): void {
    this.modelInDatabase = merge(
      this.modelToUpdate,
      this.modelInDatabase,
      this.logger
    )
    this.modelInDatabase.lastModifiedAt = Date.now()
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
      this.response.entity = this.convertLinks(this.modelInDatabase)
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

  protected async beforeLoadingModelFromDatabase(): Promise<void> {}

  protected async afterLoadingModelFromDatabase(): Promise<void> {}

  protected async afterVerifyingStateEntryConstraints(): Promise<void> {}

  protected async beforeCreatingResponse(): Promise<void> {}

  protected async beforeMergeNewModelWithDatabaseModel(): Promise<void> {}

  protected async afterMergeNewModelWithDatabaseModel(): Promise<void> {}

  protected async beforeUpdatingModelInDatabase(): Promise<void> {}

  protected async afterModelHasBeenUpdatedInDatabase(): Promise<void> {}
}
