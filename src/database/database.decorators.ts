import { Constructor } from '../types'
import { container, inject, Lifecycle, singleton } from 'tsyringe'
import constructor from 'tsyringe/dist/typings/types/constructor'
import { AbstractRepository } from './repositories/abstract-repository'

export const Repository = <T extends AbstractRepository>(
  _: Constructor<T>
): ((target: constructor<T>) => void) => singleton

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
