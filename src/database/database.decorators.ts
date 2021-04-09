import { Constructor } from '../utility-types'
import { container, inject, Lifecycle } from 'tsyringe'

export const Repository = (target: Constructor): void => {
  container.registerSingleton(target)
}

export const UserRepository = (target: Constructor): void => {
  container.register('UserRepository', target, {
    lifecycle: Lifecycle.Singleton,
  })
}

export const injectUserRepository = (): ((
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number
) => any) => {
  return inject('UserRepository')
}
