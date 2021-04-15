import { injectable } from 'tsyringe'
import { Constructor } from '../../types'
import { IAuthenticationInfoProvider } from './authentication-info-provider'

export const AuthenticationInfoProvider = <
  T extends IAuthenticationInfoProvider
>(): ((target: Constructor<T>) => void) => {
  return (target: Constructor<T>) => {
    injectable()(target)
  }
}
