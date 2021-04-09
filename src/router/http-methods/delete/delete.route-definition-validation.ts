import { FullRouteDefinition } from '../../route-definitions'
import { RouteRegistrationError } from '../../errors/route-registration-error'

export const validateDeleteRoutes = (
  routeDefinitions: FullRouteDefinition[],
  controller: string
): void => {
  for (const definition of routeDefinitions) {
    if (typeof definition.consumes !== 'undefined') {
      throw new RouteRegistrationError(
        `Route handler "${
          controller + '.' + definition.method.toString()
        }" provides a consuming media type.`
      )
    }

    if (typeof definition.schema?.body !== 'undefined') {
      throw new RouteRegistrationError(
        `Route handler "${
          controller + '.' + definition.method.toString()
        }" provides request body validation.`
      )
    }
  }
}
