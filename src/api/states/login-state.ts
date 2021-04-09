import { HttpResponse } from '../../router/http-response'
import { FastifyRequest } from 'fastify'
import { AbstractStateWithCaching } from './abstract-state-with-caching'
import { CachingType } from '../caching'

export class LoginState extends AbstractStateWithCaching {
  constructor() {
    super()
  }

  protected req: FastifyRequest

  protected async buildInternal(): Promise<HttpResponse> {
    this.configureState()

    this.extractFromRequest()

    if ((await this.verifyApiKey()) === false) {
      return this.response.unauthorized('API key required.')
    }

    if ((await this.verifyRolesOfClient()) === false) {
      return this.response.forbidden('You have no power here!')
    }

    if ((await this.verifyAllStateEntryConstraints()) === false) {
      return this.response.forbidden('You have no power here!')
    }

    return await this.createResponse()
  }

  protected async createResponse(): Promise<HttpResponse> {
    this.defineHttpCaching()

    await this.defineTransitionLinks()

    this.defineAuthenticationResponseHeaders()

    return this.response.ok()
  }

  protected defineTransitionLinks(): Promise<void> | void {
    this.addLink('/users/{}', 'self', 'application/json', [
      this.authenticationInfo.userModel.id,
    ])
  }

  protected extractFromRequest(): void {}

  protected configureState(): void {
    this.activateUserAuthentication()
    this.setHttpCachingType(CachingType.DEACTIVATE_CACHE)
  }
}
