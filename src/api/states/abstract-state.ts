import { FastifyRequest } from 'fastify'
import { Logger } from 'pino'
import { container } from 'tsyringe'
import { HttpResponse } from '../../router/http-response'
import {
  AuthenticationHeader,
  AuthenticationInfo,
  AuthenticationInfoTokenToRespond,
  IAuthenticationInfoProvider,
  Roles,
} from '../security'
import { ApiKeyHeader, ApiKeyInfo, IApiKeyInfoProvider } from '../api-key'
import { Constraint } from '../constraints'
import { buildLink, convertLinks } from '../links'
import { AbstractModel } from '../../models'
import { HttpRequest } from '../../router/http-request'
import { Configured } from './state.configured'
import constants from '../../constants'
import { ExtractOptions } from './state.extract-options'
import { HttpError } from '../../router/errors/http-error'

export abstract class AbstractState {
  protected readonly logger: Logger

  protected req: FastifyRequest

  protected response: HttpResponse

  protected readonly authenticationInfoProvider: IAuthenticationInfoProvider

  protected readonly apiKeyInfoProvider: IApiKeyInfoProvider

  protected apiKeyVerificationActivated = false

  protected userAuthenticationActivated = false

  protected readonly stateEntryConstraints: Constraint<this>[] = []

  protected allowedRoles = new Roles()

  /**
   * After method {@link #verifyRolesOfClient()} this object contains information about the user that
   * has sent this request.
   */
  protected authenticationInfo: AuthenticationInfo

  protected apiKeyHeader: ApiKeyHeader

  protected constructor() {
    this.logger = container
      .resolve<Logger>(constants.LOGGER)
      .child({ state: this.constructor.name })

    this.authenticationInfoProvider = container.resolve<IAuthenticationInfoProvider>(
      constants.AUTHENTICATION_INFO_PROVIDER
    )

    this.apiKeyInfoProvider = container.resolve<IApiKeyInfoProvider>(
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
    if (
      typeof this.req === 'undefined' ||
      typeof this.response === 'undefined'
    ) {
      this.logger.error(
        'Please configure the state before you call the build() method.'
      )
    }

    await this.buildInternal()
  }

  protected async verifyApiKey(): Promise<boolean> {
    if (this.apiKeyVerificationActivated) {
      return await this.verifyNecessaryApiKey()
    } else {
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
    this.authenticationInfo = await this.authenticationInfoProvider.get(
      authenticationHeader
    )

    if (
      this.authenticationInfo === undefined ||
      this.authenticationInfo.isAuthenticated === false
    ) {
      return false
    } else {
      return this.authenticationInfo.hasRoles(this.allowedRoles)
    }
  }

  protected activateApiKeyCheck(): void {
    this.apiKeyVerificationActivated = true
  }

  protected configureState(): void {}

  protected abstract extractFromRequest(): void

  private extractFrom<T extends string | number | boolean>(
    from: 'query' | 'params' | 'headers',
    key: string,
    transformTo: 'string' | 'boolean' | 'number',
    defaultValue?: T,
    options: ExtractOptions<T> = {}
  ): T | undefined {
    let value: string | number | boolean = (this.req as any)[from][key]

    if (typeof value === 'undefined' && options.throwIfUndefined === true) {
      throw new HttpError(
        400,
        'Bad Request',
        `Value of '${key}' in request ${from} cannot be undefined.`
      )
    }

    if (typeof options.validate === 'function') {
      options.validate(value as T)
    }

    switch (transformTo) {
      case 'string':
        break
      case 'boolean': {
        value = value == 'true'
        break
      }
      case 'number': {
        value = +value
        if (isNaN(value)) {
          value = defaultValue
        }
        break
      }
    }

    return <T>value ?? defaultValue
  }

  protected extractNumberFromQuery(
    key: string,
    defaultValue?: number,
    options: ExtractOptions<number> = {}
  ): number {
    return this.extractFrom<number>(
      'query',
      key,
      'number',
      defaultValue,
      options
    )
  }

  protected extractBoolFromQuery(
    key: string,
    defaultValue?: boolean,
    options: ExtractOptions<boolean> = {}
  ): boolean {
    return this.extractFrom<boolean>(
      'query',
      key,
      'boolean',
      defaultValue,
      options
    )
  }

  protected extractFromQuery(
    key: string,
    defaultValue?: string,
    options: ExtractOptions<string> = {}
  ): string {
    return this.extractFrom<string>(
      'query',
      key,
      'string',
      defaultValue,
      options
    )
  }

  protected extractNumberFromParams(
    key: string,
    defaultValue?: number,
    options: ExtractOptions<number> = {}
  ): number {
    return this.extractFrom<number>(
      'params',
      key,
      'number',
      defaultValue,
      options
    )
  }

  protected extractBoolFromParams(
    key: string,
    defaultValue?: boolean,
    options: ExtractOptions<boolean> = {}
  ): boolean {
    return this.extractFrom<boolean>(
      'params',
      key,
      'boolean',
      defaultValue,
      options
    )
  }

  protected extractFromParams(
    key: string,
    defaultValue?: string,
    options: ExtractOptions<string> = {}
  ): string {
    return this.extractFrom<string>(
      'params',
      key,
      'string',
      defaultValue,
      options
    )
  }
  protected extractNumberFromHeaders(
    key: string,
    defaultValue?: number,
    options: ExtractOptions<number> = {}
  ): number {
    return this.extractFrom<number>(
      'headers',
      key,
      'number',
      defaultValue,
      options
    )
  }

  protected extractBoolFromHeaders(
    key: string,
    defaultValue?: boolean,
    options: ExtractOptions<boolean> = {}
  ): boolean {
    return this.extractFrom<boolean>(
      'headers',
      key,
      'boolean',
      defaultValue,
      options
    )
  }

  protected extractFromHeaders(
    key: string,
    defaultValue?: string,
    options: ExtractOptions<string> = {}
  ): string {
    return this.extractFrom<string>(
      'headers',
      key,
      'string',
      defaultValue,
      options
    )
  }

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
    return this.req.headers['content-type']
  }

  protected getAcceptedMediaType(): string {
    return this.req.acceptedMediaType
  }

  private async verifyNecessaryApiKey(): Promise<boolean> {
    this.apiKeyHeader = new ApiKeyHeader(this.req)

    const apiKeyInfo: ApiKeyInfo = await this.getApiKeInfo(this.apiKeyHeader)

    return apiKeyInfo.isValid()
  }

  /**
   * Override this methods in specific sub-classes
   */
  protected convertLinks(models: AbstractModel): AbstractModel
  protected convertLinks(models: AbstractModel[]): AbstractModel[]
  protected convertLinks(
    models: AbstractModel | AbstractModel[]
  ): AbstractModel | AbstractModel[] {
    return convertLinks(<AbstractModel>models, this.req.baseUrl())
  }
}
