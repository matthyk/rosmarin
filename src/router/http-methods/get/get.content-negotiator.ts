import { CompiledRouteDefinition } from '../../route-definitions'
import Negotiator from 'negotiator'
import { RouterError } from '../../errors/router-error'
import { hasDuplicate } from '../../utils'
import constants from '../../../constants'
import { RouteRegistrationError } from '../../errors/route-registration-error'

/**
 * If a route definition has no producing media type the default  media type "application/json" is set.
 */
export class ContentNegotiator {
  private readonly mediaTypes: string[]

  constructor(private readonly routeDefinitions: CompiledRouteDefinition[]) {
    this.routeDefinitions = routeDefinitions.map(
      (definition: CompiledRouteDefinition) => {
        if (typeof definition.produces === 'undefined')
          definition.produces = constants.DEFAULT_MEDIA_TYPE
        return definition
      }
    )
    this.mediaTypes = routeDefinitions.map(
      (definition: CompiledRouteDefinition) => definition.produces
    )

    const duplicatedMediaType = this.findConflictingRoutes()

    if (duplicatedMediaType)
      throw new RouteRegistrationError(
        `Conflicting route definitions found. You have registered multiple routes that produces the media type "${duplicatedMediaType}".`
      )
  }

  private findConflictingRoutes(): string | undefined {
    return hasDuplicate(this.mediaTypes, (a, b) => a === b)
  }

  /**
   * If no Accept header is sent by the client implies that client accepts any media type
   * See https://tools.ietf.org/html/rfc7231#section-5.3.2
   */
  public retrieveHandler(accept = '*/*'): CompiledRouteDefinition {
    const negotiator = new Negotiator({ headers: { accept } })

    const acceptedMediaTypes = negotiator.mediaTypes(this.mediaTypes)

    if (acceptedMediaTypes.length === 0) {
      /*
      If the media type is not acceptable the server SHOULD generate a payload containing a list of available media types.
      See https://tools.ietf.org/html/rfc7231#section-6.5.6
       */
      throw new RouterError(
        406,
        'Not Acceptable',
        `Media type "${accept}" is not acceptable. Acceptable media types: ${this.mediaTypes.join(
          ', '
        )}.`
      )
    }

    return this.routeDefinitions.find(
      (definition: CompiledRouteDefinition) =>
        definition.produces === acceptedMediaTypes[0]
    )
  }
}
