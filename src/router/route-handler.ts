import { CompiledRouteDefinition } from './route-definitions'
import { RouteHandlerMethod } from 'fastify/types/route'
import {
  deleteRouteHandler,
  getRouteHandler,
  HttpMethod,
  postRouteHandler,
  putRouteHandler,
} from './http-methods'

export const createRouteHandler = (
  routeDefinitions: CompiledRouteDefinition[],
  controller: unknown,
  httpMethod: HttpMethod
): RouteHandlerMethod => {
  switch (httpMethod) {
    case 'GET': {
      return getRouteHandler(routeDefinitions, controller)
    }
    case 'POST': {
      return postRouteHandler(routeDefinitions, controller)
    }
    case 'DELETE': {
      return deleteRouteHandler(routeDefinitions, controller)
    }
    case 'PUT': {
      return putRouteHandler(routeDefinitions, controller)
    }
    default: {
      throw new Error(`HTTP method ${httpMethod} is not supported.`)
    }
  }
}
