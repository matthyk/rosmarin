import { Schemas } from '../route-definition'
import { RouteGenericInterface } from 'fastify/types/route'
import { ReturnsHttpResponse, TypedMethodDecorator } from '../utility-types'
import { Route } from './route'

/**
 * There should be no validation schema defined for GET requests, because the request payload should be ignored anyway.
 * See https://tools.ietf.org/html/rfc7231#section-4.3.1
 */
export interface GetRouteDefinition {
  path?: string
  outputSchema?: Schemas<Record<string, unknown>>
  produces?: string[]
}

export const Get = <
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface
>(
  routeDefinition: GetRouteDefinition
): TypedMethodDecorator<ReturnsHttpResponse<RouteGeneric>> => {
  return Route({
    ...routeDefinition,
    httpMethod: 'GET',
  })
}
