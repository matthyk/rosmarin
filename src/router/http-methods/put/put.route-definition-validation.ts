import { FullRouteDefinition } from '../../route-definitions'
import { RouteRegistrationError } from '../../errors/route-registration-error'

export const validatePutRoutes = (
  routeDefinitions: FullRouteDefinition[],
  controller: string
): void => {
  for (const definition of routeDefinitions) {
    if (typeof definition.consumes === 'undefined') {
      throw new RouteRegistrationError(
        `Route handler "${
          controller + '.' + definition.method.toString()
        }" does NOT provide a consuming media type but it's required.`
      )
    }

    if (typeof definition.schema?.body !== 'function') {
      throw new RouteRegistrationError(
        `Route handler "${
          controller + '.' + definition.method.toString()
        }" does NOT provide request body type.`
      )
    }
  }
}
