import { FullRouteDefinition } from '../route-definitions'
import { Constructor, Target } from '../../types'
import { routerMetadataStore } from '../../metadata-stores'
import { TypedMethodDecorator } from '../types'

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
    routerMetadataStore.addRoute(target.constructor as Constructor, {
      ...routeDefinition,
      method,
    })

    return descriptor
  }
}
