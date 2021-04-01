import { AbstractModel } from '../../abstract-model'
import { AbstractState } from '../abstract-state'
import { ModelId } from '../../types'
import { SingleModelDatabaseResult } from '../../../database/results/single-model-database-result'
import { NoContentDatabaseResult } from '../../../database/results/no-content-database-result'
import { HttpResponse } from '../../../router/http-response'
import { createEtag } from '../../caching/etag-generator'
import { FastifyRequest } from 'fastify'

export abstract class AbstractDeleteState<
  T extends AbstractModel
> extends AbstractState {
  protected modelIdToDelete: ModelId

  protected modelForConstraintCheck: AbstractModel

  protected dbResultAfterGet: SingleModelDatabaseResult<T>

  protected dbResultAfterDelete: NoContentDatabaseResult

  protected responseStatus200 = false

  protected req: FastifyRequest<{ Params: { id: ModelId } }>

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

    this.dbResultAfterGet = await this.loadModelFromDatabase()

    if (this.dbResultAfterGet.isEmpty()) {
      return this.response.notFound()
    }

    this.modelForConstraintCheck = this.dbResultAfterGet.result

    if ((await this.verifyAllStateEntryConstraints()) === false) {
      return this.response.forbidden()
    }

    if (this.clientKnowsCurrentModelState() === false) {
      return this.response.preconditionFailed()
    }

    this.dbResultAfterDelete = await this.deleteModelInDatabase()

    if (this.dbResultAfterDelete.hasError()) {
      return this.response.internalServerError()
    }

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
      this.response.entity = this.convertModelToView(
        this.dbResultAfterGet.result
      )
    }
  }

  protected extractFromRequest(): void {
    this.modelIdToDelete = this.req.params.id
  }

  protected abstract defineTransitionLinks(): Promise<void> | void
}
