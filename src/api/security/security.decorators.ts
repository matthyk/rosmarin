import { container, Lifecycle } from 'tsyringe'
import { Constructor } from '../../utility-types'
import { IAuthenticationInfoProvider } from './authentication-info-provider'
import constants from '../../constants'

export const AuthenticationInfoProvider = <
  T extends IAuthenticationInfoProvider
>(
  target: Constructor<T>
): void => {
  container.register(constants.AUTHENTICATION_INFO_PROVIDER, target, {
    lifecycle: Lifecycle.Singleton,
  })
}
