import { Schemas } from '../route-definition'
import { RouteGenericInterface } from 'fastify/types/route'
import { ReturnsHttpResponse, TypedMethodDecorator } from '../utility-types'
import { Route } from './route'

export interface PutRouteDefinition {
  path?: string
  schema?: Schemas<Record<string, unknown>>
  outputSchema?: Record<string, unknown>
  consumes?: string[]
  produces?: string[]
}

export const Put = <
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface
>(
  routeDefinition: PutRouteDefinition
): TypedMethodDecorator<ReturnsHttpResponse<RouteGeneric>> => {
  return Route({
    ...routeDefinition,
    httpMethod: 'PUT',
  })
}
