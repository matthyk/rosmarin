import Negotiator from 'negotiator'
import { hasDuplicate } from '../../utils'
import { CompiledRouteDefinition } from '../../route-definitions'
import { RouterError } from '../../errors/router-error'
import constants from '../../../constants'

export class ContentNegotiator {
  private readonly producingMediaTypes: string[] = []
  private readonly consumingMediaTypes: Set<string> = new Set<string>()

  constructor(private readonly routeDefinitions: CompiledRouteDefinition[]) {
    const set: Set<string> = new Set<string>()
    routeDefinitions.forEach((def: CompiledRouteDefinition) => {
      if (def.produces) set.add(def.produces)

      if (typeof def.consumes === 'undefined') {
        def.consumes = constants.DEFAULT_MEDIA_TYPE
      }
      // def.produces ? `and produces "${def.produces}` : ''
      if (this.consumingMediaTypes.has(def.consumes)) {
        throw new Error(
          `Conflicting route definitions found. You have registered multiple routes that consumes the media type "${def.consumes}"` +
            (def.produces ? ` and produces "${def.produces}".` : '.')
        )
      }

      this.consumingMediaTypes.add(def.consumes)
    })

    this.producingMediaTypes = Array.from(set)

    const duplicatedRouteDefinition = this.findConflictingRoutes()

    if (typeof this.findConflictingRoutes() !== 'undefined')
      throw new Error(
        `Conflicting route definitions found. You have registered multiple routes that consumes the media type ${
          duplicatedRouteDefinition.consumes
        } and produces ${duplicatedRouteDefinition.produces ?? ''}.`
      )
  }

  private findConflictingRoutes(): CompiledRouteDefinition | undefined {
    return hasDuplicate(
      this.routeDefinitions,
      (a: CompiledRouteDefinition, b: CompiledRouteDefinition) =>
        a.consumes === b.consumes && a.produces === b.produces
    )
  }

  public retrieveHandler(
    contentType = 'application/octet-stream',
    accept = '*/*'
  ): CompiledRouteDefinition {
    if (this.consumingMediaTypes.has(contentType) === false) {
      throw new RouterError(
        415,
        'Unsupported Media Type',
        `Media Type "${contentType}" is not supported for the specific route.`
      )
    }

    const negotiator: Negotiator = new Negotiator({ headers: { accept } })

    const mediaTypes: string[] = negotiator.mediaTypes(this.producingMediaTypes)

    // let's first try to find an exact matching route handler
    for (let i = 0; i < mediaTypes.length; i++) {
      const found = this.routeDefinitions.find(
        (def: CompiledRouteDefinition) => {
          return def.consumes === contentType && def.produces === mediaTypes[i]
        }
      )

      if (typeof found !== 'undefined') return found
    }

    if (accept !== '*/*') {
      throw new RouterError(
        406,
        'Not Acceptable',
        `Media type "${accept}" is not acceptable. Acceptable media types: ${this.producingMediaTypes.join(
          ', '
        )}`
      )
    }

    const found = this.routeDefinitions.find((def: CompiledRouteDefinition) => {
      return def.consumes === contentType && typeof def.produces === 'undefined'
    })

    if (typeof found !== 'undefined') return found

    throw new RouterError(
      406,
      'Not Acceptable',
      `Media type "${accept}" is not acceptable. Acceptable media types: ${this.producingMediaTypes.join(
        ', '
      )}`
    )
  }
}
