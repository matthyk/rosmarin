import { Schemas } from '../route-definition'
import { RouteGenericInterface } from 'fastify/types/route'
import { ReturnsHttpResponse, TypedMethodDecorator } from '../utility-types'
import { Route } from './route'

export interface PatchRouteDefinition {
  path?: string
  schema?: Schemas<Record<string, unknown>>
  outputSchema?: Schemas<Record<string, unknown>>
  consumes?: string[]
  produces?: string[]
}

export const Patch = <
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface
>(
  routeDefinition: PatchRouteDefinition
): TypedMethodDecorator<ReturnsHttpResponse<RouteGeneric>> => {
  return Route({
    ...routeDefinition,
    httpMethod: 'PATCH',
  })
}
