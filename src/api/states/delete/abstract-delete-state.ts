import { AbstractModel, ModelId } from '../../../models'
import { AbstractState } from '../abstract-state'
import {
  NoContentDatabaseResult,
  SingleModelDatabaseResult,
} from '../../../database'
import { HttpResponse } from '../../../router/http-response'
import { createEtag } from '../../caching'
import { FastifyRequest } from 'fastify'

export abstract class AbstractDeleteState<
  T extends AbstractModel
> extends AbstractState {
  protected modelIdToDelete: ModelId

  protected modelForConstraintCheck: AbstractModel

  protected dbResultAfterGet: SingleModelDatabaseResult<T>

  protected dbResultAfterDelete: NoContentDatabaseResult

  protected responseStatus200 = false

  protected req: FastifyRequest

  protected async buildInternal(): Promise<HttpResponse> {
    this.configureState()

    this.extractFromRequest()

    if ((await this.verifyApiKey()) === false) {
      return this.response.unauthorized('API key required.')
    }

    if ((await this.verifyRolesOfClient()) === false) {
      return this.response.unauthorized('You have no power here!')
    }

    // locking

    await this.beforeLoadingModelFromDatabase()

    this.dbResultAfterGet = await this.loadModelFromDatabase()

    await this.afterLoadingModelFromDatabase()

    if (this.dbResultAfterGet.isEmpty()) {
      return this.response.notFound()
    }

    this.modelForConstraintCheck = this.dbResultAfterGet.result

    await this.beforeVerifyingStateEntryConstraints()

    if ((await this.verifyAllStateEntryConstraints()) === false) {
      return this.response.forbidden()
    }

    await this.afterVerifyingStateEntryConstraints()

    if (this.clientKnowsCurrentModelState() === false) {
      return this.response.preconditionFailed()
    }

    await this.beforeDeletingModelInDatabase()

    this.dbResultAfterDelete = await this.deleteModelInDatabase()

    await this.afterModelHasBeenDeletedInDatabase()

    if (this.dbResultAfterDelete.hasError()) {
      return this.response.internalServerError()
    }

    await this.beforeCreatingResponse()

    return this.createResponse()
  }

  protected abstract loadModelFromDatabase(): Promise<
    SingleModelDatabaseResult<T>
  >

  protected clientKnowsCurrentModelState(): boolean {
    const currentEtag: string = this.createEntityTagOfResult()
    const lastModifiedAt: number = this.dbResultAfterGet.result.lastModifiedAt

    return this.req.evaluateConditionalPutRequest(lastModifiedAt, currentEtag)
  }

  private createEntityTagOfResult(): string {
    return createEtag(this.dbResultAfterGet.result)
  }

  protected abstract deleteModelInDatabase(): Promise<NoContentDatabaseResult>

  protected async createResponse(): Promise<HttpResponse> {
    this.defineResponseStatus()

    this.defineHttpResponseBody()

    await this.defineTransitionLinks()

    return this.response
  }

  private defineResponseStatus(): void {
    this.responseStatus200 ? this.response.ok() : this.response.noContent()
  }

  private defineHttpResponseBody(): void {
    if (this.responseStatus200) {
      this.response.entity = this.convertLinks(this.dbResultAfterGet.result)
    }
  }

  protected extractFromRequest(): void {
    this.modelIdToDelete = this.extractFromParams('id')
  }

  protected abstract defineTransitionLinks(): Promise<void> | void

  protected async beforeLoadingModelFromDatabase(): Promise<void> {}

  protected async afterLoadingModelFromDatabase(): Promise<void> {}

  protected async afterVerifyingStateEntryConstraints(): Promise<void> {}

  protected async beforeCreatingResponse(): Promise<void> {}

  protected async beforeMergeNewModelWithDatabaseModel(): Promise<void> {}

  protected async beforeVerifyingStateEntryConstraints(): Promise<void> {}

  protected async beforeDeletingModelInDatabase(): Promise<void> {}

  protected async afterModelHasBeenDeletedInDatabase(): Promise<void> {}
}
