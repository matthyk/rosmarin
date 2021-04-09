import { CompiledRouteDefinition } from '../../route-definitions'
import { RouterError } from '../../errors/router-error'
import { hasDuplicate } from '../../utils'
import Negotiator from 'negotiator'

/**
 * @Delete() routes can be defined without a producing media type
 */
export class ContentNegotiator {
  private readonly mediaTypes: string[]

  constructor(private readonly routeDefinitions: CompiledRouteDefinition[]) {
    this.mediaTypes = routeDefinitions
      .filter(
        (definition: CompiledRouteDefinition) =>
          typeof definition.produces !== 'undefined'
      )
      .map((definition: CompiledRouteDefinition) => definition.produces)

    const duplicatedMediaType = this.findConflictingRoutes()

    if (duplicatedMediaType)
      throw new Error(
        `Conflicting route definitions found. You have registered multiple routes that produces the media type "${duplicatedMediaType}".`
      )
  }

  private findConflictingRoutes(): string | undefined {
    return hasDuplicate(this.mediaTypes, (a, b) => a === b)
  }

  public retrieveHandler(accept = '*/*'): CompiledRouteDefinition {
    const negotiator = new Negotiator({ headers: { accept } })

    const acceptedMediaTypes = negotiator.mediaTypes(this.mediaTypes)

    if (acceptedMediaTypes.length === 0) {
      throw new RouterError(
        406,
        'Not Acceptable',
        `Media type ${accept} is not acceptable. Acceptable media types: ${this.mediaTypes.join(
          ', '
        )}`
      )
    }

    return this.routeDefinitions.find(
      (definition: CompiledRouteDefinition) =>
        definition.produces === acceptedMediaTypes[0]
    )
  }
}
