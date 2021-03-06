import { AbstractState } from '../abstract-state'
import { HttpResponse } from '../../../router'
import { CacheControl } from '../../caching'
import { linkHeader } from '../../links'
import RelationTypes from '../../relation-types'

export abstract class AbstractGetDispatcherState extends AbstractState {
  protected async buildInternal(): Promise<HttpResponse> {
    this.configureState()

    if ((await this.verifyApiKey()) === false) {
      return this.response.unauthorized('API key required.')
    }

    return this.createResponse()
  }

  private createResponse(): HttpResponse {
    this.defineHttpResponseBody()

    this.defineHttpCaching()

    this.defineSelfLink()

    this.defineTransitionLinks()

    this.defineAuthenticationResponseHeaders()

    return this.response.ok()
  }

  protected defineHttpCachingByCacheControl(): void {
    const cacheControl: CacheControl = new CacheControl()
    cacheControl.noCache = true
    cacheControl.noStore = true

    this.response.cacheControl(cacheControl)
  }

  private defineHttpResponseBody(): void {
    return undefined
  }

  private defineHttpCaching(): void {
    this.defineHttpCachingByCacheControl()
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

  protected abstract defineTransitionLinks(): void
}
