import { CompiledRouteDefinition } from '../../route-definitions'
import { RouterError } from '../../router-error'
import { hasDuplicate } from '../../utils'

/**
 * This content negotiator assumes that the response payload of a POST request is empty.
 */
export class ContentNegotiator {
  private readonly mediaTypes: string[]

  constructor(private readonly routeDefinitions: CompiledRouteDefinition[]) {
    this.mediaTypes = routeDefinitions.map(
      (definition: CompiledRouteDefinition) => definition.consumes
    )

    const duplicatedMediaType = this.findConflictingRoutes()

    if (duplicatedMediaType)
      throw new Error(
        `Conflicting route definitions found. You have registered multiple routes that consumes the media type "${duplicatedMediaType}".`
      )
  }

  private findConflictingRoutes(): string | undefined {
    return hasDuplicate(this.mediaTypes, (a, b) => a === b)
  }

  /**
   * If no Content-Type header is provided, rosmarin DOES assume that the content type is "application/octet-stream"
   * as suggested in https://tools.ietf.org/html/rfc7231#section-3.1.1.5.
   */
  public retrieveHandler(
    contentType = 'application/octet-stream'
  ): CompiledRouteDefinition {
    const found:
      | CompiledRouteDefinition
      | undefined = this.routeDefinitions.find(
      (def: CompiledRouteDefinition) => {
        return def.consumes === contentType
      }
    )

    if (typeof found === 'undefined') {
      throw new RouterError(
        415,
        'Unsupported Media Type',
        `Media Type ${contentType} is not supported for the specific route.`
      )
    }

    return found
  }
}
