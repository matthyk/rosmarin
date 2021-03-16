import { RouteGenericInterface } from 'fastify/types/route'
import { RouteDefinition } from '../route-definition'
import {
  ReturnsHttpResponse,
  Target,
  TypedMethodDecorator,
} from '../utility-types'
import constants from '../constants'

export const Route = <
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface
>(
  routeDefinition: Omit<RouteDefinition, 'method'>
): TypedMethodDecorator<ReturnsHttpResponse<RouteGeneric>> => {
  return function (
    target: Target,
    method: string | symbol,
    descriptor: TypedPropertyDescriptor<ReturnsHttpResponse<RouteGeneric>>
  ): TypedPropertyDescriptor<ReturnsHttpResponse<RouteGeneric>> {
    const definitions: RouteDefinition[] = (Reflect.getMetadata(
      constants.CONTROLLER_ROUTES,
      target.constructor
    ) ?? []) as RouteDefinition[]

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
