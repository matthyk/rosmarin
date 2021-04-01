import { FullRouteDefinition } from '../route-definitions'
import { Target, TypedMethodDecorator } from '../utility-types'
import constants from '../../constants'

/**
 * This method/decorator gives the user the possibility to define arbitrary controller routes. However, it is strongly
 * recommended not to use this method, as it is possible to define non-HTTP and REST compliant routes with this method.
 *
 * PLEASE use the HTTP method specific methods/decorators.
 */
export const Route = (
  routeDefinition: Omit<FullRouteDefinition, 'method'>
): TypedMethodDecorator<any> => {
  return function (
    target: Target,
    method: string | symbol,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const definitions: FullRouteDefinition[] = (Reflect.getMetadata(
      constants.CONTROLLER_ROUTES,
      target.constructor
    ) ?? []) as FullRouteDefinition[]

    definitions.push({
      ...routeDefinition,
      method,
    })

    Reflect.defineMetadata(
      constants.CONTROLLER_ROUTES,
      definitions,
      target.constructor
    )

    return descriptor
  }
}
