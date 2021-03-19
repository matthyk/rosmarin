import 'reflect-metadata'
import { Constructor, Target } from '../../routing/utility-types'
import constants from './constants'

export const prop = (target: Target, propertyKey: string): void => {
  const props: string[] =
    Reflect.getMetadata(constants.VIEW_PROPS, target.constructor) ?? []

  props.push(propertyKey)

  Reflect.defineMetadata(constants.VIEW_PROPS, props, target.constructor)
}

export type Converter<From, To = unknown> = (from: From) => To

export const convertTo = <From, To>(
  to: Constructor<To>
): Converter<From, To> => {
  return (from: From): To => {
    const props: string[] = Reflect.getMetadata(constants.VIEW_PROPS, to)

    const instance = new to()

    for (const prop of props) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (from[prop]) instance[prop] = from[prop]
    }

    return instance
  }
}
