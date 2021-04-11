import { FullRouteDefinition } from '../../route-definitions'
import { RouteRegistrationError } from '../../errors/route-registration-error'

export const validatePostRoutes = (
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

    if (typeof definition.produces !== 'undefined') {
      throw new RouteRegistrationError(
        `Route handler "${
          controller + '.' + definition.method.toString()
        }" provides a producing media type.`
      )
    }

    if (typeof definition.viewConverter !== 'undefined') {
      throw new RouteRegistrationError(
        `Route handler "${
          controller + '.' + definition.method.toString()
        }" provides a View Converter.`
      )
    }

    if (typeof definition.schema.body.transformer !== 'function') {
      throw new RouteRegistrationError(
        `Route handler "${
          controller + '.' + definition.method.toString()
        }" does NOT provide request body type.`
      )
    }
  }
}
