import { FullRouteDefinition } from '../route-definitions'
import { HttpMethod } from './http-method'
import { validateGetRoutes } from './get/get.route-definition-validation'
import { validateDeleteRoutes } from './delete/delete.route-definition-validation'
import { validatePostRoutes } from './post/post.route-definition-validation'
import { validatePutRoutes } from './put/put.route-definition-validation'

export const validateRouteDefinitions = (
  routeDefinitions: FullRouteDefinition[],
  httpMethod: HttpMethod,
  controller: string
): void => {
  switch (httpMethod) {
    case 'GET': {
      validateGetRoutes(routeDefinitions, controller)
      break
    }
    case 'POST': {
      validatePostRoutes(routeDefinitions, controller)
      break
    }
    case 'DELETE': {
      validateDeleteRoutes(routeDefinitions, controller)
      break
    }
    case 'PUT': {
      validatePutRoutes(routeDefinitions, controller)
      break
    }
    case 'PATCH':
      break
    case 'HEAD':
      break
    case 'OPTIONS':
      break
  }
}
