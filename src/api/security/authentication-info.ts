import { AbstractModel } from '../../models'
import { Roles } from './roles'
import { AuthenticationInfoTokenToRespond } from './authentication-info-token-to-respond'

export class AuthenticationInfo {
  public static readonly NOT_AUTHENTICATED: AuthenticationInfo = AuthenticationInfo.isAuthenticated(
    false
  )

  public principal: string

  public credential: string

  public roles: string[]

  public isAuthenticated: boolean

  public userModel: AbstractModel

  public tokenToRespond: AuthenticationInfoTokenToRespond | undefined

  public static isAuthenticated(isAuthenticated: boolean): AuthenticationInfo {
    const authenticationInfo = new AuthenticationInfo()

    authenticationInfo.isAuthenticated = isAuthenticated
    authenticationInfo.tokenToRespond = undefined

    return authenticationInfo
  }

  public static withTokenToRespond(
    tokenToRespond: AuthenticationInfoTokenToRespond
  ): AuthenticationInfo {
    const authenticationInfo = AuthenticationInfo.isAuthenticated(true)

    authenticationInfo.tokenToRespond = tokenToRespond

    return authenticationInfo
  }

  public static withTokenToRespondAndPrincipal(
    tokenToRespond: AuthenticationInfoTokenToRespond,
    principal: string,
    roles: string[],
    userModel: AbstractModel
  ): AuthenticationInfo {
    const authenticationInfo = AuthenticationInfo.withTokenToRespond(
      tokenToRespond
    )

    authenticationInfo.principal = principal
    authenticationInfo.roles = roles
    authenticationInfo.userModel = userModel

    return authenticationInfo
  }

  constructor()
  constructor(principal: string, credential: string)
  constructor(principal: string, credential: string, roles: string[])
  constructor(
    principal: string,
    credential: string,
    roles: string[],
    userModel: AbstractModel
  )
  constructor(
    principal?: string,
    credential?: string,
    roles?: string[],
    userModel?: AbstractModel
  ) {
    this.principal = principal
    this.credential = credential
    this.roles = roles
    this.userModel = userModel
  }

  public hasRoles(roles: Roles): boolean {
    return roles.matches(this.roles)
  }

  public clearTokenToRespond(): void {
    this.tokenToRespond = undefined
  }
}
