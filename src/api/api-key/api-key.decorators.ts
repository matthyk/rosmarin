import { injectable } from 'tsyringe'
import { Constructor } from '../../types'
import { IApiKeyInfoProvider } from './api-key-info-provider'

export const ApiKeyInfoProvider = <T extends IApiKeyInfoProvider>(): ((
  target: Constructor<T>
) => void) => {
  return (target: Constructor<T>) => {
    injectable()(target)
  }
}
