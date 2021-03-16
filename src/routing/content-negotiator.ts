import Negotiator from 'negotiator'
import { RoutingError } from './routing-error'
import { RouteDefinitionWithValidationFn } from './route-definition'

export interface NegotiationResult {
  routeDefinition: RouteDefinitionWithValidationFn
  acceptedMediaType?: string
}

// If no Content-Type header is provided, rosmarin DOES NOT assume that the content type is "application/octet-stream"
// as suggested in https://tools.ietf.org/html/rfc7231#section-3.1.1.5

// TODO: should we check if user has registered multiple identical routes or just document that first added route will be called?
export class ContentNegotiator {
  private readonly allProducedMediaTypes: string[]
  private readonly allConsumedMediaTypes: Set<string> = new Set<string>()
  private routeWithoutConsumesAndProduces?: RouteDefinitionWithValidationFn

  constructor(
    private readonly routeDefinitions: RouteDefinitionWithValidationFn[]
  ) {
    const allProducedMediaTypesSet = new Set<string>()
    routeDefinitions.forEach((definition: RouteDefinitionWithValidationFn) => {
      definition.produces?.forEach((mediaType) =>
        allProducedMediaTypesSet.add(mediaType)
      )
      definition.consumes?.forEach((mediaType) =>
        this.allConsumedMediaTypes.add(mediaType)
      )
    })

    this.allProducedMediaTypes = Array.from(allProducedMediaTypesSet)

    const routesWithoutConsumesAndProduces = routeDefinitions.filter(
      ContentNegotiator.consumesAndProducedAreUndefined.bind(this)
    )

    if (routesWithoutConsumesAndProduces?.length > 1) {
      throw new Error(
        `You cannot register ${routesWithoutConsumesAndProduces.length} routes that do not have any consuming and producing media types.`
      )
    }

    this.routeWithoutConsumesAndProduces = routesWithoutConsumesAndProduces.find(
      Boolean
    )
  }

  private static consumesAndProducedAreUndefined(
    definition: RouteDefinitionWithValidationFn
  ): boolean {
    return (
      ContentNegotiator.isNotProvided(definition.produces) &&
      ContentNegotiator.isNotProvided(definition.consumes)
    )
  }

  private static isNotProvided(value: string[] | undefined): boolean {
    return typeof value === 'undefined' || value?.length === 0
  }

  // If no Accept header is sent by the client implies that client accepts any media type
  // See https://tools.ietf.org/html/rfc7231#section-5.3.2
  public retrieveHandler(
    accept: string | undefined,
    contentType: string | undefined
  ): NegotiationResult {
    const negotiator: Negotiator = new Negotiator({
      headers: { accept: accept ?? '*/*' },
    })

    const mediaTypes: string[] = negotiator.mediaTypes(
      this.allProducedMediaTypes
    )

    if (!contentType) {
      if (mediaTypes.length === 0) {
        if (!this.routeWithoutConsumesAndProduces) {
          throw new RoutingError(406, 'Not Acceptable')
        } else {
          return { routeDefinition: this.routeWithoutConsumesAndProduces }
        }
      }

      for (let i = 0; i < mediaTypes.length; i++) {
        const found:
          | RouteDefinitionWithValidationFn
          | undefined = this.routeDefinitions.find(
          (definition) =>
            definition.produces?.includes(mediaTypes[i]) &&
            ContentNegotiator.isNotProvided(definition.consumes)
        )

        if (found)
          return { routeDefinition: found, acceptedMediaType: mediaTypes[i] }
      }

      throw new RoutingError(415, 'Unsupported Media Type')
    } else {
      if (mediaTypes.length === 0) {
        if (!this.allConsumedMediaTypes.has(contentType)) {
          if (!this.routeWithoutConsumesAndProduces) {
            throw new RoutingError(406, 'Not Acceptable')
          } else {
            return { routeDefinition: this.routeWithoutConsumesAndProduces }
          }
        } else {
          const found:
            | RouteDefinitionWithValidationFn
            | undefined = this.routeDefinitions.find((definition) => {
            return (
              ContentNegotiator.isNotProvided(definition.produces) &&
              definition.consumes?.includes(contentType)
            )
          })

          if (!found) {
            throw new RoutingError(406, 'Not Acceptable')
          } else {
            return { routeDefinition: found }
          }
        }
      } else {
        if (!this.allConsumedMediaTypes.has(contentType)) {
          for (let i = 0; i < mediaTypes.length; i++) {
            const found:
              | RouteDefinitionWithValidationFn
              | undefined = this.routeDefinitions.find((definition) => {
              return (
                ContentNegotiator.isNotProvided(definition.consumes) &&
                definition.produces?.includes(mediaTypes[i])
              )
            })

            if (found)
              return {
                routeDefinition: found,
                acceptedMediaType: mediaTypes[i],
              }
          }

          throw new RoutingError(415, 'Unsupported Media Type')
        } else {
          for (let i = 0; i < mediaTypes.length; i++) {
            const found:
              | RouteDefinitionWithValidationFn
              | undefined = this.routeDefinitions.find((definition) => {
              return (
                definition.consumes?.includes(contentType) &&
                definition.produces?.includes(mediaTypes[i])
              )
            })

            if (found)
              return {
                routeDefinition: found,
                acceptedMediaType: mediaTypes[i],
              }
          }

          throw new RoutingError(415, 'Unsupported Media Type')
        }
      }
    }
  }
}
