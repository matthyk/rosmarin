import { AbstractModel, AbstractViewModel } from '../../../models'
import { AbstractState } from '../abstract-state'
import { NoContentDatabaseResult } from '../../../database'
import { HttpResponse } from '../../../router/http-response'
import { merge } from '../../views'
import { FastifyRequest } from 'fastify'

export abstract class AbstractPostState<
  T extends AbstractModel,
  V extends AbstractViewModel
> extends AbstractState {
  protected modelToCreate: V

  protected modelToStoreInDatabase: T

  protected modelForConstraintCheck: AbstractModel

  protected dbResultAfterSave: NoContentDatabaseResult

  protected req: FastifyRequest<{ Body: V }>

  protected async buildInternal(): Promise<HttpResponse> {
    this.configureState()

    this.extractFromRequest()

    if ((await this.verifyApiKey()) === false) {
      return this.response.unauthorized('API key required.')
    }

    if ((await this.verifyRolesOfClient()) === false) {
      return this.response.unauthorized('You have no power here!')
    }

    this.modelForConstraintCheck = this.modelToCreate

    if ((await this.verifyAllStateEntryConstraints()) === false) {
      return this.response.forbidden('Forbidden')
    }

    this.mergeViewModelToDatabaseModel()

    this.dbResultAfterSave = await this.createModelInDatabase()

    if (this.dbResultAfterSave.hasError()) {
      return this.response.internalServerError()
    }

    return await this.createResponse()
  }

  protected async createResponse(): Promise<HttpResponse> {
    this.defineLocationLink()

    await this.defineTransitionLinks()

    return this.response
  }

  protected extractFromRequest(): void {
    this.modelToCreate = this.req.body
  }

  protected defineLocationLink(): void {
    const locationLink: string =
      this.req.fullUrl() + '/' + this.modelToStoreInDatabase.id
    this.response.location(locationLink)
    this.response.created()
  }

  protected abstract defineTransitionLinks(): Promise<void> | void

  private mergeViewModelToDatabaseModel(): void {
    this.modelToStoreInDatabase = this.createDatabaseModel()
    this.modelToStoreInDatabase = this.merge(
      this.modelToCreate,
      this.modelToStoreInDatabase
    )
    this.modelToStoreInDatabase.lastModifiedAt = Date.now()
  }

  /**
   * You should override this method in subclasses if you do not want to use the built-in merge function which requires to annotate the incoming view model
   */
  protected merge(source: V, target: T): T {
    return merge(source, target)
  }

  protected abstract createDatabaseModel(): T

  protected abstract createModelInDatabase(): Promise<NoContentDatabaseResult>
}
