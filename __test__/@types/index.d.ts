import { RouteDefinition } from '../src/router/route-definition'

declare global {
  namespace jest {
    interface Matchers<R> {
      toContainRouteDefinition(
        routeDefinition: RouteDefinition
      ): CustomMatcherResult
    }
  }
}
