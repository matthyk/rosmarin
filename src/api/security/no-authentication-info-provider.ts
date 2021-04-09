import { IAuthenticationInfoProvider } from './authentication-info-provider'
import { AuthenticationInfo } from './authentication-info'
import { AuthenticationHeader } from './authentication-header'

export class NoAuthenticationInfoProvider
  implements IAuthenticationInfoProvider {
  public async get(_: AuthenticationHeader): Promise<AuthenticationInfo> {
    return AuthenticationInfo.NOT_AUTHENTICATED
  }
}
