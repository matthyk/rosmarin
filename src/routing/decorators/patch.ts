import { Schemas } from '../route-definition'
import { RouteGenericInterface } from 'fastify/types/route'
import { ReturnsHttpResponse, TypedMethodDecorator } from '../utility-types'
import { Route } from './route'
import { Schema } from 'fast-json-stringify'

export interface PatchRouteDefinition {
  path?: string
  schema?: Schemas<Record<string, unknown>>
  outputSchema?: Schema
  consumes: string
  produces?: string
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
