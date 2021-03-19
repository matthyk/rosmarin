import { FastifyRequest } from 'fastify'
import { Logger } from 'pino'
import { container } from 'tsyringe'
import constants from '../constants'
import { HttpResponse } from '../../routing/http-response'
import { AuthenticationInfo } from '../security/authentication-info'
import { ApiKeyInfo } from '../apiKey/api-key-info'
import { Constraint } from '../constraints/constraint'
import { ApiKeyHeader } from '../apiKey/api-key-header'
import { AuthenticationHeader } from '../security/authentication-header'
import { StateContext } from '../state-context'
import { Roles } from '../security/roles'
import { AuthenticationInfoProvider } from '../security/authentication-info-provider'
import { ApiKeyInfoProvider } from '../apiKey/api-key-info-provider'
import { AuthenticationInfoTokenToRespond } from '../security/authentication-info-token-to-respond'
import { buildLink } from './hyperlinks'

// noinspection JSMethodCanBeStatic
export abstract class AbstractState {
  protected readonly logger: Logger

  protected _req: FastifyRequest

  protected response: HttpResponse

  protected readonly authenticationInfoProvider: AuthenticationInfoProvider

  protected readonly apiKeyInfoProvider: ApiKeyInfoProvider

  protected _apiKeyVerificationActivated = false

  protected _userAuthenticationActivated = false

  protected _stateEntryConstraints: Constraint<this>[] = []

  protected _stateContext: StateContext = new StateContext()

  protected _authenticationInfo: AuthenticationInfo

  protected _allowedRoles = new Roles()

  /**
   * After method {@link #verifyRolesOfClient()} this object contains information about the user that
   * has sent this request.
   */
  protected _authInfo: AuthenticationInfo

  protected _apiKeyHeader: ApiKeyHeader

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

  public get req(): FastifyRequest {
    return this._req
  }

  public set req(value: FastifyRequest) {
    this._req = value
  }

  public get apiKeyVerificationActivated(): boolean {
    return this._apiKeyVerificationActivated
  }

  public set apiKeyVerificationActivated(value: boolean) {
    this._apiKeyVerificationActivated = value
  }

  public get userAuthenticationActivated(): boolean {
    return this._userAuthenticationActivated
  }

  public set userAuthenticationActivated(value: boolean) {
    this._userAuthenticationActivated = value
  }

  public get stateEntryConstraints(): Constraint<this>[] {
    return this._stateEntryConstraints
  }

  public set stateEntryConstraints(value: Constraint<this>[]) {
    this._stateEntryConstraints = value
  }

  public get stateContext(): StateContext {
    return this._stateContext
  }

  public set stateContext(value: StateContext) {
    this._stateContext = value
  }

  public get authInfo(): AuthenticationInfo {
    return this._authInfo
  }

  public set authInfo(value: AuthenticationInfo) {
    this._authInfo = value
  }

  public get apiKeyHeader(): ApiKeyHeader {
    return this._apiKeyHeader
  }

  public set apiKeyHeader(value: ApiKeyHeader) {
    this._apiKeyHeader = value
  }

  public get authenticationInfo(): AuthenticationInfo {
    return this._authenticationInfo
  }

  public set authenticationInfo(value: AuthenticationInfo) {
    this._authenticationInfo = value
  }

  protected get allowedRoles(): Roles {
    return this._allowedRoles
  }

  protected set allowedRoles(value: Roles) {
    this._allowedRoles = value
  }

  public configure(req: FastifyRequest, response: HttpResponse): this {
    this._req = req
    this.response = response
    return this
  }

  protected abstract buildInternal(): Promise<HttpResponse>

  protected addStateEntryConstraint(constraint: Constraint<this>): void {
    this._stateEntryConstraints.push(constraint)
  }

  protected async verifyAllStateEntryConstraints(): Promise<boolean> {
    const promisedConstraints = this._stateEntryConstraints.map((constraint) =>
      constraint.call(this)
    )

    return (await Promise.all(promisedConstraints)).every(Boolean)
  }

  protected async verifyRolesOfClient(): Promise<boolean> {
    if (this._userAuthenticationActivated) {
      const auth: boolean = await this.authorizeUser(
        new AuthenticationHeader(this._req)
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
    this._userAuthenticationActivated = true
  }

  public async build(): Promise<HttpResponse> {
    try {
      return this.buildInternal()
    } catch (error) {
      this.logger.error(`An unexpected error has occurred.\n${error.stack}`)

      return this.response.internalServerError()
    }
  }

  protected async verifyApiKey(): Promise<boolean> {
    if (this._apiKeyVerificationActivated) {
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
    return this._allowedRoles.matchesWithoutAuthentication()
  }

  private async isAccessAllowedForThisUser(
    authenticationHeader: AuthenticationHeader
  ): Promise<boolean> {
    this._authInfo = await this.getAuthenticationInfo(authenticationHeader)

    if (
      this._authInfo === undefined ||
      this._authInfo.isAuthenticated === false
    ) {
      return false
    } else {
      return this._authInfo.hasRoles(this._allowedRoles)
    }
  }

  private async getAuthenticationInfo(
    authenticationHeader: AuthenticationHeader
  ): Promise<AuthenticationInfo> {
    this._authenticationInfo = await this.authenticationInfoProvider.get(
      authenticationHeader
    )
    this._stateContext.put(StateContext.ST_AUTH_USER, this._authenticationInfo)
    return this._authenticationInfo
  }

  protected activateApiKeyCheck(): void {
    this._apiKeyVerificationActivated = true
  }

  protected configureState(): void {}

  protected defineAuthenticationResponseHeaders(): void {
    if (
      this._authenticationInfo !== undefined &&
      this._authenticationInfo.isAuthenticated
    ) {
      if (this._authenticationInfo.tokenToRespond !== undefined) {
        const respond: AuthenticationInfoTokenToRespond = this
          ._authenticationInfo.tokenToRespond
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
          this._req.baseUrl + uriTemplate,
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
        this._req.baseUrl + uriTemplate,
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
    return headerName ? this._req.headers[headerName] : this._req.headers.accept
  }

  protected getAcceptedMediaType(): string {
    return this._req.acceptedMediaType
  }

  private async verifyNecessaryApiKey(): Promise<boolean> {
    this._apiKeyHeader = new ApiKeyHeader(this._req)

    const apiKeyInfo: ApiKeyInfo = await this.getApiKeInfo(this._apiKeyHeader)

    return apiKeyInfo.isValid()
  }
}
