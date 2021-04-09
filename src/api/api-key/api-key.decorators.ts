import { container, Lifecycle } from 'tsyringe'
import { Constructor } from '../../utility-types'
import constants from '../../constants'
import { IApiKeyInfoProvider } from './api-key-info-provider'

export const ApiKeyInfoProvider = <T extends IApiKeyInfoProvider>(
  target: Constructor<T>
): void => {
  container.register(constants.API_KEY_INFO_PROVIDER, target, {
    lifecycle: Lifecycle.Singleton,
  })
}
