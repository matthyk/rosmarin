import { Schemas } from '../route-definition'
import { RouteGenericInterface } from 'fastify/types/route'
import { ReturnsHttpResponse, TypedMethodDecorator } from '../utility-types'
import { Route } from './route'

export interface PostRouteDefinition {
  path?: string
  schema?: Schemas<Record<string, unknown>>
  consumes?: string[]
}

export const Post = <
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface
>(
  routeDefinition: PostRouteDefinition
): TypedMethodDecorator<ReturnsHttpResponse<RouteGeneric>> => {
  return Route({
    ...routeDefinition,
    httpMethod: 'POST',
  })
}
