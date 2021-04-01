import { FastifyRequest } from 'fastify'
import { Logger } from 'pino'
import { container } from 'tsyringe'
import { HttpResponse } from '../../router/http-response'
import { AuthenticationInfo } from '../security/authentication-info'
import { ApiKeyInfo } from '../api-key/api-key-info'
import { Constraint } from '../constraints/constraint'
import { ApiKeyHeader } from '../api-key/api-key-header'
import { AuthenticationHeader } from '../security/authentication-header'
import { StateContext } from '../state-context'
import { Roles } from '../security/roles'
import { AuthenticationInfoProvider } from '../security/authentication-info-provider'
import { ApiKeyInfoProvider } from '../api-key/api-key-info-provider'
import { AuthenticationInfoTokenToRespond } from '../security/authentication-info-token-to-respond'
import { buildLink } from './hyperlinks'
import { AbstractModel } from '../abstract-model'
import { convertLinks } from '../views/link-converter'
import { HttpRequest } from '../../router/http-request'
import { Configured } from './configured'
import constants from '../../constants'

// noinspection JSMethodCanBeStatic
export abstract class AbstractState {
  protected readonly logger: Logger

  protected req: FastifyRequest

  protected response: HttpResponse

  protected readonly authenticationInfoProvider: AuthenticationInfoProvider

  protected readonly apiKeyInfoProvider: ApiKeyInfoProvider

  protected apiKeyVerificationActivated = false

  protected userAuthenticationActivated = false

  protected stateEntryConstraints: Constraint<this>[] = []

  protected stateContext: StateContext = new StateContext()

  protected authenticationInfo: AuthenticationInfo

  protected allowedRoles = new Roles()

  /**
   * After method {@link #verifyRolesOfClient()} this object contains information about the user that
   * has sent this request.
   */
  protected authInfo: AuthenticationInfo

  protected apiKeyHeader: ApiKeyHeader

  protected constructor() {
    this.logger = container
      .resolve<Logger>(constants.LOGGER)
      .child({ context: this.constructor.name })

    this.authenticationInfoProvider = container.resolve<AuthenticationInfoProvider>(
      constants.AUTHENTICATION_INFO_PROVIDER
    )

    this.apiKeyInfoProvider = container.resolve<ApiKeyInfoProvider>(
      constants.API_KEY_INFO_PROVIDER
    )
  }

  public configure(
    req: HttpRequest<any>,
    response: HttpResponse
  ): Configured<this> {
    this.req = req
    this.response = response
    return { state: this }
  }

  protected abstract buildInternal(): Promise<HttpResponse>

  protected addStateEntryConstraint(constraint: Constraint<this>): void {
    this.stateEntryConstraints.push(constraint)
  }

  protected async verifyAllStateEntryConstraints(): Promise<boolean> {
    const promisedConstraints = this.stateEntryConstraints.map((constraint) =>
      constraint.call(this)
    )

    return (await Promise.all(promisedConstraints)).every(Boolean)
  }

  protected async verifyRolesOfClient(): Promise<boolean> {
    if (this.userAuthenticationActivated) {
      const auth: boolean = await this.authorizeUser(
        new AuthenticationHeader(this.req)
      )
      this.logger.debug(
        `Authentication activated. User is authorized: ${auth}.`
      )
      return auth
    } else {
      this.logger.debug(`Authentication NOT activated..`)
      return true
    }
  }

  protected activateUserAuthentication(): void {
    this.userAuthenticationActivated = true
  }

  public async build(): Promise<void> {
    await this.buildInternal()
  }

  protected async verifyApiKey(): Promise<boolean> {
    if (this.apiKeyVerificationActivated) {
      const check: boolean = await this.verifyNecessaryApiKey()
      this.logger.debug('API Key check activated and result was: ' + check)
      return check
    } else {
      this.logger.debug('API Key check NOT activated.')
      return true
    }
  }

  private async authorizeUser(
    authenticationHeader: AuthenticationHeader
  ): Promise<boolean> {
    if (authenticationHeader.isSet()) {
      return await this.isAccessAllowedForThisUser(authenticationHeader)
    } else {
      return this.isAccessWithoutAuthenticationAllowed()
    }
  }

  private isAccessWithoutAuthenticationAllowed(): boolean {
    return this.allowedRoles.matchesWithoutAuthentication()
  }

  private async isAccessAllowedForThisUser(
    authenticationHeader: AuthenticationHeader
  ): Promise<boolean> {
    this.authInfo = await this.getAuthenticationInfo(authenticationHeader)

    if (
      this.authInfo === undefined ||
      this.authInfo.isAuthenticated === false
    ) {
      return false
    } else {
      return this.authInfo.hasRoles(this.allowedRoles)
    }
  }

  private async getAuthenticationInfo(
    authenticationHeader: AuthenticationHeader
  ): Promise<AuthenticationInfo> {
    this.authenticationInfo = await this.authenticationInfoProvider.get(
      authenticationHeader
    )
    this.stateContext.put(StateContext.ST_AUTH_USER, this.authenticationInfo)
    return this.authenticationInfo
  }

  protected activateApiKeyCheck(): void {
    this.apiKeyVerificationActivated = true
  }

  protected configureState(): void {}

  protected abstract extractFromRequest(): void

  protected defineAuthenticationResponseHeaders(): void {
    if (
      this.authenticationInfo !== undefined &&
      this.authenticationInfo.isAuthenticated
    ) {
      if (this.authenticationInfo.tokenToRespond !== undefined) {
        const respond: AuthenticationInfoTokenToRespond = this
          .authenticationInfo.tokenToRespond
        this.response.header(respond.tokenHeaderName, respond.token)
      }
    }
  }

  protected getApiKeInfo(apiKey: ApiKeyHeader): Promise<ApiKeyInfo> {
    return this.apiKeyInfoProvider.get(apiKey)
  }

  protected async addConstrainedLink(
    constraint: Constraint,
    uriTemplate: string,
    relType: string,
    params?: unknown[]
  ): Promise<void>
  protected async addConstrainedLink(
    constraint: Constraint,
    uriTemplate: string,
    relType: string,
    mediaType: string,
    params?: unknown[]
  ): Promise<void>
  protected async addConstrainedLink(
    constraint: Constraint,
    uriTemplate: string,
    relType: string,
    mediaTypeOrParams: string | unknown[] = [],
    params: unknown[] = []
  ): Promise<void> {
    if ((await constraint.call(this)) === true) {
      this.response.link(
        buildLink(
          this.req.baseUrl() + uriTemplate,
          relType,
          mediaTypeOrParams,
          params
        )
      )
    }
  }

  /**
   * Add a link header to the HTTP response.
   * Placeholder "{}" can be used to insert params into the link.
   */
  protected addLink(
    uriTemplate: string,
    relType: string,
    params?: unknown[]
  ): void
  protected addLink(
    uriTemplate: string,
    relType: string,
    mediaType: string,
    params?: unknown[]
  ): void
  protected addLink(
    uriTemplate: string,
    relType: string,
    mediaTypeOrParams: string | unknown[] = [],
    params: unknown[] = []
  ): void {
    this.response.link(
      buildLink(
        this.req.baseUrl() + uriTemplate,
        relType,
        mediaTypeOrParams,
        params
      )
    )
  }

  protected getMediaTypeFromContentTypeHeader(): string {
    return this.getMediaTypeFromAcceptHeader('content-type') as string
  }

  protected getMediaTypeFromAcceptHeader(): string
  protected getMediaTypeFromAcceptHeader(headerName: string): string | string[]
  protected getMediaTypeFromAcceptHeader(
    headerName?: string
  ): string | string[] {
    return headerName ? this.req.headers[headerName] : this.req.headers.accept
  }

  protected getAcceptedMediaType(): string {
    return this.req.acceptedMediaType
  }

  private async verifyNecessaryApiKey(): Promise<boolean> {
    this.apiKeyHeader = new ApiKeyHeader(this.req)

    const apiKeyInfo: ApiKeyInfo = await this.getApiKeInfo(this.apiKeyHeader)

    return apiKeyInfo.isValid()
  }

  protected convertModelToView(model: AbstractModel): AbstractModel {
    return convertLinks(model, this.req.baseUrl())
  }
}
