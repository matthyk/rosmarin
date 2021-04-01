import { HttpMethod } from './http-methods/http-method'
import { ValidateFunction } from 'ajv'
import { Constructor, StringifyFn } from './utility-types'

/**
 * This interface is used for every HTTP verb although not every route handler uses everything in this interface.
 * But that's fine because the specific handlers use what they need and don't touch the rest.
 * For example if the user uses the @Route() method to define a non-HTTP compliant @GET() endpoint with a request
 * payload validation the GET route-handler just ignores the request payload AND the validation.
 * This prevents the user from developing non HTTP and REST compliant APIs
 */
export interface CompiledRouteDefinition extends BaseRouteDefinition {
  validationAndTransformation?: Schemas<ValidatorAndTransformer>
  stringifyFn?: StringifyFn
}

export interface BaseRouteDefinition {
  produces?: string
  consumes?: string
  method: string | symbol
}

export interface Schemas<T = Constructor, V = T> {
  body?: V
  query?: T
  params?: T
}

export interface FullRouteDefinition extends BaseRouteDefinition {
  path?: string
  httpMethod: HttpMethod
  schema?: Schemas
  outputSchema?: Constructor
}

export interface ValidatorAndTransformer<T = unknown> {
  validationFn: ValidateFunction
  transformer: (plain: unknown) => T
}
