import { AbstractModel, ModelId } from '../../../models'
import { AbstractStateWithCaching } from '../abstract-state-with-caching'
import { HttpResponse } from '../../../router/http-response'
import { SingleModelDatabaseResult } from '../../../database'
import { linkHeader } from '../../links'
import RelationTypes from '../../relation-types'
import { FastifyRequest } from 'fastify'

export abstract class AbstractGetState<
  T extends AbstractModel
> extends AbstractStateWithCaching {
  public constructor() {
    super()
  }

  protected req: FastifyRequest<{ Body: never }>

  protected requestedId: ModelId

  protected modelForConstraintCheck: AbstractModel

  protected requestedModel: SingleModelDatabaseResult<T>

  protected async buildInternal(): Promise<HttpResponse> {
    this.configureState()

    this.extractFromRequest()

    if ((await this.verifyApiKey()) === false) {
      return this.response.unauthorized('API key required.')
    }

    if ((await this.verifyRolesOfClient()) === false) {
      return this.response.forbidden('You have no power here!') // TODO: 401 vs 403?
    }

    this.requestedModel = await this.loadModelFromDatabase()

    if (this.requestedModel.hasError()) {
      return this.response.internalServerError()
    }

    if (this.requestedModel.isEmpty()) {
      // TODO provide user the possibility to throw custom error
      return this.response.notFound('This resource does not exist.')
    }

    this.modelForConstraintCheck = this.requestedModel.result

    if ((await this.verifyAllStateEntryConstraints()) === false) {
      return this.response.forbidden('You have no power here!')
    }

    if (this.clientKnowsCurrentModelState()) {
      return this.response.notModified()
      // TODO: set headers
      // TODO: Question: Should links be sent too?
    }

    this.modelForCaching = this.requestedModel.result // TODO: ???

    return await this.createResponse()
  }

  protected async createResponse(): Promise<HttpResponse> {
    // this.defineHttpResponseBody()

    this.defineModelForCaching(this.requestedModel.result)

    this.defineHttpCaching()

    this.defineHttpResponseBody() // We had to change the order here, because the etag value was affected by the generated links

    // this.defineHttpCaching()

    this.defineSelfLink()

    await this.defineTransitionLinks()

    this.defineAuthenticationResponseHeaders()

    return this.response.ok()
  }

  protected defineHttpResponseBody(): void {
    this.response.entity = this.convertLinks(this.requestedModel.result)
  }

  protected abstract defineTransitionLinks(): Promise<void> | void

  protected abstract loadModelFromDatabase(): Promise<
    SingleModelDatabaseResult<T>
  >

  protected extractFromRequest(): void {
    this.requestedId = this.extractFromParams('id')
  }

  protected clientKnowsCurrentModelState(): boolean {
    const currentEtag: string = this.createEntityTagOfResult(
      this.requestedModel.result
    )

    return this.req.evaluateConditionalGetRequest(
      this.requestedModel.result.lastModifiedAt,
      currentEtag
    )
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
