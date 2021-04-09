import { ContentNegotiator } from '../../../../../src/router/http-methods/get/get.content-negotiator'
import { CompiledRouteDefinition } from '../../../../../src/router/route-definitions'
import { RouteRegistrationError } from '../../../../../src/router/errors/route-registration-error'
import { RouterError } from '../../../../../src/router/errors/router-error'

describe('Content Negotiator for GET requests', () => {
  const definitions: CompiledRouteDefinition[] = [
    {
      method: 'A',
      produces: 'text/html',
    },
    {
      method: 'B',
      produces: 'application/json',
    },
    {
      method: 'C',
      produces: 'application/vnd.user+json',
    },
  ]

  const negotiator = new ContentNegotiator(definitions)

  it('should throw error if 2 route definitions produces the same media type', () => {
    const incorrectDefinitions: CompiledRouteDefinition[] = [
      {
        method: 'A',
        produces: 'text/html',
      },
      {
        method: 'B',
        produces: 'text/html',
      },
      {
        method: 'C',
        produces: 'text/plain',
      },
    ]

    expect(() => new ContentNegotiator(incorrectDefinitions)).toThrowError(
      RouteRegistrationError
    )
  })

  it('should return route definitions with matching media type', () => {
    const result = negotiator.retrieveHandler('application/json')

    expect(result).toBe(definitions[1])
  })

  it('should return first registered route if client accept every media type', () => {
    const result = negotiator.retrieveHandler()

    expect(result).toBe(definitions[0])
  })

  it('should return first matching route if multiple would match', () => {
    const result = negotiator.retrieveHandler('application/*')

    expect(result).toBe(definitions[1])
  })

  it('should throw error if media type is not acceptable', () => {
    expect(() => negotiator.retrieveHandler('image/*')).toThrowError(
      RouterError
    )
  })

  it('should throw error and generate list of available media types if media type is not acceptable', () => {
    const errMessage = `Media type "image/*" is not acceptable. Acceptable media types: text/html, application/json, application/vnd.user+json.`

    expect(() => negotiator.retrieveHandler('image/*')).toThrowError(
      new RouterError(406, 'Not Acceptable', errMessage)
    )
  })
})
