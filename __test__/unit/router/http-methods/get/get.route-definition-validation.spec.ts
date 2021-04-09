import { FullRouteDefinition } from '../../../../../src/router/route-definitions'
import { AbstractModel } from '../../../../../src'
import { AbstractViewModel } from '../../../../../src'
import {
  buildValidatorAndTransformer,
  validateGetRoutes,
} from '../../../../../src'
import { RouteRegistrationError } from '../../../../../src/router/errors/route-registration-error'
import { buildViewConverter } from '../../../../../src'

describe('GET route definition validation', () => {
  class Model extends AbstractModel {}

  class View extends AbstractViewModel {}

  const correctDefinition: FullRouteDefinition = {
    httpMethod: 'GET',
    produces: 'text/html',
    method: 'A',
    viewConverter: buildViewConverter(Model, View),
  }

  const missingViewConverterDefinition: FullRouteDefinition = {
    httpMethod: 'GET',
    produces: 'text/html',
    method: 'A',
  }

  const additionalConsumes: FullRouteDefinition = {
    httpMethod: 'GET',
    produces: 'text/html',
    consumes: 'text/plain',
    method: 'A',
    viewConverter: buildViewConverter(Model, View),
  }

  const additionalValidationSchema: FullRouteDefinition = {
    httpMethod: 'GET',
    produces: 'text/html',
    consumes: 'text/plain',
    method: 'A',
    viewConverter: buildViewConverter(Model, View),
    schema: {
      body: buildValidatorAndTransformer(View),
    },
  }

  const missingProduces: FullRouteDefinition = {
    httpMethod: 'GET',
    method: 'A',
    viewConverter: buildViewConverter(Model, View),
  }

  it('should not throw error if definition is HTTP and REST compliant', () => {
    expect(() =>
      validateGetRoutes([correctDefinition], 'controller')
    ).not.toThrow()
  })

  it('should throw error if definition has additional consumes property', () => {
    expect(() => validateGetRoutes([additionalConsumes], 'controller')).toThrow(
      RouteRegistrationError
    )
  })

  it('should throw error if definition has no produces property', () => {
    expect(() => validateGetRoutes([missingProduces], 'controller')).toThrow(
      RouteRegistrationError
    )
  })

  it('should throw error if definition has request body validation property', () => {
    expect(() =>
      validateGetRoutes([additionalValidationSchema], 'controller')
    ).toThrow(RouteRegistrationError)
  })

  it('should throw error if definition has invalid view converter property', () => {
    expect(() =>
      validateGetRoutes([missingViewConverterDefinition], 'controller')
    ).toThrow(RouteRegistrationError)
  })
})
