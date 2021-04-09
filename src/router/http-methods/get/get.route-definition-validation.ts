import { FullRouteDefinition } from '../../route-definitions'
import { RouteRegistrationError } from '../../errors/route-registration-error'

export const validateGetRoutes = (
  routeDefinitions: FullRouteDefinition[],
  controller: string
): void => {
  for (const definition of routeDefinitions) {
    if (typeof definition.produces !== 'string') {
      throw new RouteRegistrationError(
        `Route handler "${
          controller + '.' + definition.method.toString()
        }" does not provide a producing media type but it is required.`
      )
    }

    if (typeof definition.viewConverter !== 'function') {
      throw new RouteRegistrationError(
        `Route handler "${
          controller + '.' + definition.method.toString()
        }" does not provide a View Converter.`
      )
    }

    if (typeof definition.consumes !== 'undefined') {
      throw new RouteRegistrationError(
        `Route handler "${
          controller + '.' + definition.method.toString()
        }" provides a consuming media type which is NOT HTTP compliant.`
      )
    }
  }
}
