import { AbstractModel } from '../abstract-model'
import { Roles } from './roles'
import { AuthenticationInfoTokenToRespond } from './authentication-info-token-to-respond'

export class AuthenticationInfo {
  public static readonly NOT_AUTHENTICATED: AuthenticationInfo = new AuthenticationInfo(
    false
  )

  private _principal: string

  private _credential: string

  private _roles: string[]

  private _isAuthenticated: boolean

  private _userModel: AbstractModel

  private _tokenToRespond: AuthenticationInfoTokenToRespond | undefined

  constructor(isAuthenticated: boolean)
  constructor(tokenToRespond: AuthenticationInfoTokenToRespond)
  constructor(
    principal: string,
    tokenToRespond: AuthenticationInfoTokenToRespond,
    roles: string[]
  )
  constructor(principal: string, credential: string)
  constructor(principal: string, credential: string, roles: string[])
  constructor(
    principal: string,
    credential: string,
    roles: string[],
    userModel: AbstractModel
  )
  constructor(
    isAuthenticatedOrPrincipalOrTokenToRespond:
      | boolean
      | AuthenticationInfoTokenToRespond
      | string,
    tokenToRespondOrCredential?: AuthenticationInfoTokenToRespond | string,
    roles?: string[],
    userModel?: AbstractModel
  ) {
    if (typeof isAuthenticatedOrPrincipalOrTokenToRespond === 'boolean') {
      this._isAuthenticated = isAuthenticatedOrPrincipalOrTokenToRespond
      this._tokenToRespond = undefined
    } else if (
      isAuthenticatedOrPrincipalOrTokenToRespond instanceof
      AuthenticationInfoTokenToRespond
    ) {
      this._isAuthenticated = true
      this._tokenToRespond = isAuthenticatedOrPrincipalOrTokenToRespond
    } else if (
      typeof isAuthenticatedOrPrincipalOrTokenToRespond === 'string' &&
      tokenToRespondOrCredential instanceof AuthenticationInfoTokenToRespond
    ) {
      this._isAuthenticated = true
      this._tokenToRespond = tokenToRespondOrCredential
      this._principal = isAuthenticatedOrPrincipalOrTokenToRespond
      this._roles = roles
      this._userModel = userModel
    } else if (
      typeof isAuthenticatedOrPrincipalOrTokenToRespond === 'string' &&
      typeof tokenToRespondOrCredential === 'string' &&
      typeof roles === 'undefined' &&
      typeof userModel === 'undefined'
    ) {
      this._isAuthenticated = true
      this._tokenToRespond = undefined
      this._principal = isAuthenticatedOrPrincipalOrTokenToRespond
      this._credential = tokenToRespondOrCredential
      this._roles = []
    } else if (
      typeof isAuthenticatedOrPrincipalOrTokenToRespond === 'string' &&
      typeof tokenToRespondOrCredential === 'string' &&
      typeof userModel === 'undefined'
    ) {
      this._isAuthenticated = true
      this._tokenToRespond = undefined
      this._principal = isAuthenticatedOrPrincipalOrTokenToRespond
      this._credential = tokenToRespondOrCredential
      this._roles = roles
    } else {
      this._isAuthenticated = true
      this._tokenToRespond = undefined
      this._principal = isAuthenticatedOrPrincipalOrTokenToRespond
      this._credential = tokenToRespondOrCredential as string // TODO
      this._roles = roles
      this._userModel = userModel
    }
  }

  public get principal(): string {
    return this._principal
  }

  public get credential(): string {
    return this._credential
  }

  public get roles(): string[] {
    return this._roles
  }

  public get isAuthenticated(): boolean {
    return this._isAuthenticated
  }

  public get userModel(): AbstractModel {
    return this._userModel
  }

  public get tokenToRespond(): AuthenticationInfoTokenToRespond | undefined {
    return this._tokenToRespond
  }

  public set tokenToRespond(
    value: AuthenticationInfoTokenToRespond | undefined
  ) {
    this._tokenToRespond = value
  }

  public hasRoles(roles: Roles): boolean {
    return roles.matches(this._roles)
  }

  public clearTokenToRespond(): void {
    this._tokenToRespond = undefined
  }
}
