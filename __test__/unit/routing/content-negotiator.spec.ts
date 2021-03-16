import { ContentNegotiator } from '../../../src/routing/content-negotiator'
import { RoutingError } from '../../../src/routing/routing-error'

describe('content negotiator', () => {
  describe('accept and content type are not provided', () => {
    it('should should return first added handler which produces arbitrary media type and consumes arbitrary media type', () => {
      const neg: ContentNegotiator = new ContentNegotiator([
        {
          produces: ['application/vnd.user-admin+json'],
          method: '2',
        },
        {
          produces: ['application/vnd.user+json'],
          method: '1',
        },
      ])

      expect(neg.retrieveHandler(undefined, undefined)).toEqual({
        acceptedMediaType: 'application/vnd.user-admin+json',
        routeDefinition: {
          produces: ['application/vnd.user-admin+json'],
          method: '2',
        },
      })
    })

    it('should throw error if no route without consumes in available', () => {
      const neg: ContentNegotiator = new ContentNegotiator([
        {
          produces: ['application/xml'],
          consumes: ['application/json'],
          method: '1',
        },
      ])

      expect(() => neg.retrieveHandler(undefined, undefined)).toThrow(
        new RoutingError(415, 'Unsupported Media Type')
      )
    })
  })

  describe('only accept provided', () => {
    it('should return correct handler if requested media type is available', () => {
      const neg: ContentNegotiator = new ContentNegotiator([
        {
          produces: ['application/json'],
          method: '2',
        },
        {
          produces: ['application/vnd.book+test'],
          method: '1',
        },
      ])

      const accept = 'application/vnd.book+test'

      expect(neg.retrieveHandler(accept, undefined)).toEqual({
        acceptedMediaType: 'application/vnd.book+test',
        routeDefinition: {
          produces: ['application/vnd.book+test'],
          method: '1',
        },
      })
    })

    it('should throw 415 error if requested media type is available but no handler is available that consumes arbitrary content type', () => {
      const neg: ContentNegotiator = new ContentNegotiator([
        {
          produces: ['application/vnd.user+json', 'application/xml'],
          consumes: ['application/json'],
          method: '1',
        },
      ])

      const accept = 'application/vnd.user+json'

      expect(() => neg.retrieveHandler(accept, undefined)).toThrow(
        new RoutingError(415, 'Unsupported Media Type')
      )
    })

    it('should throw 406 error if requested media type is not available', () => {
      const neg: ContentNegotiator = new ContentNegotiator([
        {
          produces: ['application/vnd.book+json', 'application/vnd.book+xml'],
          method: '1',
        },
      ])

      const accept = 'application/vnd.book'

      expect(() => neg.retrieveHandler(accept, undefined)).toThrow(
        new RoutingError(406, 'Not Acceptable')
      )
    })

    it('should prefer handler with more specific media type', () => {
      const neg: ContentNegotiator = new ContentNegotiator([
        {
          produces: ['application/vnd.user+json'],
          method: '1',
        },
        {
          method: '2',
        },
      ])

      const accept = 'application/vnd.user+json'

      expect(neg.retrieveHandler(accept, undefined)).toEqual({
        acceptedMediaType: 'application/vnd.user+json',
        routeDefinition: {
          produces: ['application/vnd.user+json'],
          method: '1',
        },
      })
    })

    it('should return first added handler', () => {
      const neg: ContentNegotiator = new ContentNegotiator([
        {
          produces: ['application/json'],
          method: '42',
        },
        {
          produces: ['application/xml'],
          method: '41',
        },
      ])
      const contentType = 'application/*'

      expect(neg.retrieveHandler(undefined, contentType)).toEqual({
        acceptedMediaType: 'application/json',
        routeDefinition: {
          produces: ['application/json'],
          method: '42',
        },
      })
    })
  })

  describe('only content type provided', () => {
    it('should return correct handler if content type is supported', () => {
      const neg: ContentNegotiator = new ContentNegotiator([
        {
          consumes: ['application/json'],
          produces: ['application/xml'],
          method: '42',
        },
      ])

      const contentType = 'application/json'

      expect(neg.retrieveHandler(undefined, contentType)).toEqual({
        acceptedMediaType: 'application/xml',
        routeDefinition: {
          consumes: ['application/json'],
          produces: ['application/xml'],
          method: '42',
        },
      })
    })

    it('should return first added handler', () => {
      const neg: ContentNegotiator = new ContentNegotiator([
        {
          consumes: ['image/png'],
          produces: ['application/json'],
          method: '42',
        },
        {
          consumes: ['image/png'],
          produces: ['application/xml'],
          method: '41',
        },
      ])
      const contentType = 'image/png'

      expect(neg.retrieveHandler(undefined, contentType)).toEqual({
        acceptedMediaType: 'application/json',
        routeDefinition: {
          consumes: ['image/png'],
          produces: ['application/json'],
          method: '42',
        },
      })
    })

    it('should throw 415 error of content type is not supported', () => {
      const neg: ContentNegotiator = new ContentNegotiator([
        {
          consumes: ['application/json'],
          produces: ['application/xml'],
          method: '42',
        },
      ])

      const contentType = 'application/xml'

      expect(() => neg.retrieveHandler(undefined, contentType)).toThrow(
        new RoutingError(415, 'Unsupported Media Type')
      )
    })
  })

  describe('accept and content type provided', () => {
    it('should return handler with higher preference media type', () => {
      const neg: ContentNegotiator = new ContentNegotiator([
        {
          consumes: ['application/json'],
          produces: ['application/xml'],
          method: '42',
        },
        {
          consumes: ['application/json'],
          produces: ['application/javascript'],
          method: '11',
        },
      ])

      const accept = 'application/javascript;q=0.4,image/gif;q=0.39'
      const contentType = 'application/json'

      expect(neg.retrieveHandler(accept, contentType)).toEqual({
        acceptedMediaType: 'application/javascript',
        routeDefinition: {
          consumes: ['application/json'],
          produces: ['application/javascript'],
          method: '11',
        },
      })
    })

    it('should throw 415 error if request media type is acceptable but content type is not acceptable', () => {
      const neg: ContentNegotiator = new ContentNegotiator([
        {
          consumes: ['application/vnd.user+xml'],
          produces: ['application/vnd.user+json'],
          method: '13',
        },
      ])

      const accept = 'application/vnd.user+json'
      const contentType = 'application/vnd.user+json'

      expect(() => neg.retrieveHandler(accept, contentType)).toThrow(
        new RoutingError(415, 'Unsupported Media Type')
      )
    })

    it('should return handler with highest preference that also accept requested media type', () => {
      const neg: ContentNegotiator = new ContentNegotiator([
        {
          consumes: ['application/vnd.user+json'],
          produces: ['application/xml'],
          method: '42',
        },
        {
          consumes: ['application/vnd.user+json'],
          produces: ['application/jpeg', 'application/pdf'],
          method: '11',
        },
        {
          consumes: ['application/vnd.user+json'],
          produces: ['application/vnd.book+xml'],
          method: '17',
        },
      ])

      const accept =
        'application/pdf;q=1.0,image/gif;q=0.69,application/pdf;q=0.3'
      const contentType = 'application/vnd.user+json'

      expect(neg.retrieveHandler(accept, contentType)).toEqual({
        acceptedMediaType: 'application/pdf',
        routeDefinition: {
          consumes: ['application/vnd.user+json'],
          produces: ['application/jpeg', 'application/pdf'],
          method: '11',
        },
      })
    })

    it('should prefer more specific handler', () => {
      const neg: ContentNegotiator = new ContentNegotiator([
        {
          consumes: ['application/vnd.user+json'],
          produces: ['application/xml'],
          method: '42',
        },
        {
          consumes: ['application/vnd.user+json'],
          method: '11',
        },
        {
          produces: ['application/vnd.book+xml'],
          method: '17',
        },
      ])

      const contentType = 'application/vnd.user+json'
      const accept = 'application/xml'
      expect(neg.retrieveHandler(accept, contentType)).toEqual({
        acceptedMediaType: 'application/xml',
        routeDefinition: {
          consumes: ['application/vnd.user+json'],
          produces: ['application/xml'],
          method: '42',
        },
      })
    })
  })
})
