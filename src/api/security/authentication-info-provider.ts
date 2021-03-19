import { AuthenticationHeader } from './authentication-header'
import { AuthenticationInfo } from './authentication-info'

export interface AuthenticationInfoProvider {
  get(authenticationHeader: AuthenticationHeader): Promise<AuthenticationInfo>
}
