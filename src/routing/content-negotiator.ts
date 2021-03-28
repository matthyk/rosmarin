import Negotiator from 'negotiator'
import { RoutingError } from './routing-error'
import { RouteDefinitionWithValidationFn } from './route-definition'

// If no Content-Type header is provided, rosmarin DOES NOT assume that the content type is "application/octet-stream"
// as suggested in https://tools.ietf.org/html/rfc7231#section-3.1.1.5

// TODO: check if user has registered multiple identical routes
export class ContentNegotiator {
  private readonly allProducedMediaTypes: string[] = []
  private readonly allConsumedMediaTypes: Set<string> = new Set<string>()
  private routeWithoutConsumesAndProduces?: RouteDefinitionWithValidationFn

  constructor(
    private readonly routeDefinitions: RouteDefinitionWithValidationFn[]
  ) {
    if (this.findConflictingRoutes())
      throw new Error(
        `Conflicting routes found. You can not define multiple routes with the same producing and consuming media types.`
      )

    const set: Set<string> = new Set<string>()
    routeDefinitions.forEach((def: RouteDefinitionWithValidationFn) => {
      if (def.produces) set.add(def.produces)
      if (def.consumes) this.allConsumedMediaTypes.add(def.consumes)
    })

    this.allProducedMediaTypes = Array.from(set)
  }

  // terrible idea to search duplicates in an array like this but since it contains very few elements most of the time (n < 3) it is ok
  private findConflictingRoutes(): boolean {
    for (let i = 0; i < this.routeDefinitions.length; i++) {
      for (let j = 0; j < this.routeDefinitions.length; j++) {
        if (i === j) continue

        if (
          this.routeDefinitions[i].produces ===
            this.routeDefinitions[j].produces &&
          this.routeDefinitions[i].consumes ===
            this.routeDefinitions[j].consumes
        ) {
          return true
        }
      }
    }

    return false
  }

  // If no Accept header is sent by the client implies that client accepts any media type
  // See https://tools.ietf.org/html/rfc7231#section-5.3.2
  public retrieveHandler(
    accept: string | undefined,
    contentType: string | undefined
  ): RouteDefinitionWithValidationFn {
    const acceptValue: string = accept ?? '*/*'

    const negotiator: Negotiator = new Negotiator({
      headers: { accept: acceptValue },
    })

    const mediaTypes: string[] = negotiator.mediaTypes(
      this.allProducedMediaTypes
    )

    if (mediaTypes.length === 0) {
      if (contentType) {
        if (!this.allConsumedMediaTypes.has(contentType)) {
          if (!this.routeWithoutConsumesAndProduces)
            throw new RoutingError(
              406,
              'Not Acceptable',
              `Media Type '${acceptValue}' is not acceptable.`
            )

          return this.routeWithoutConsumesAndProduces
        } else {
          const found:
            | RouteDefinitionWithValidationFn
            | undefined = this.routeDefinitions.find(
            (def: RouteDefinitionWithValidationFn) => {
              return (
                def.consumes === contentType &&
                typeof def.produces === 'undefined'
              )
            }
          )

          if (!found)
            throw new RoutingError(
              415,
              `Media Type "${contentType}" is not supported.`
            )

          return found
        }
      } else {
        if (!this.routeWithoutConsumesAndProduces)
          throw new RoutingError(
            406,
            `Media Type '${acceptValue}' is not acceptable.`
          )

        return this.routeWithoutConsumesAndProduces
      }
    } else {
      if (contentType) {
        if (this.allConsumedMediaTypes.has(contentType)) {
          for (let i = 0; i < mediaTypes.length; i++) {
            const found:
              | RouteDefinitionWithValidationFn
              | undefined = this.routeDefinitions.find(
              (def: RouteDefinitionWithValidationFn) => {
                return (
                  def.consumes === contentType && def.produces === mediaTypes[i]
                )
              }
            )

            if (found) return found
          }

          for (let i = 0; i < mediaTypes.length; i++) {
            const found:
              | RouteDefinitionWithValidationFn
              | undefined = this.routeDefinitions.find(
              (def: RouteDefinitionWithValidationFn) => {
                return (
                  typeof def.consumes === 'undefined' &&
                  def.produces === mediaTypes[i]
                )
              }
            )

            if (found) return found
          }

          throw new RoutingError(
            415,
            `Media Type "${contentType}" is not supported.`
          )
        } else {
          for (let i = 0; i < mediaTypes.length; i++) {
            const found:
              | RouteDefinitionWithValidationFn
              | undefined = this.routeDefinitions.find(
              (def: RouteDefinitionWithValidationFn) => {
                return (
                  typeof def.consumes === 'undefined' &&
                  def.produces === mediaTypes[i]
                )
              }
            )

            if (found) return found
          }
          throw new RoutingError(
            415,
            'Unsupported Media Type',
            `Media Type "${contentType}" is not supported.`
          )
        }
      } else {
        for (let i = 0; i < mediaTypes.length; i++) {
          const found:
            | RouteDefinitionWithValidationFn
            | undefined = this.routeDefinitions.find(
            (def: RouteDefinitionWithValidationFn) => {
              return (
                typeof def.consumes === 'undefined' &&
                def.produces === mediaTypes[i]
              )
            }
          )

          if (found) return found
        }

        throw new RoutingError(406, 'Not Acceptable', 'Not Acceptable')
      }
    }
  }
}
