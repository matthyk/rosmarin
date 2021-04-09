import { HttpMethod } from './http-methods'
import { ValidateFunction } from 'ajv'
import { AbstractViewModel } from '../models'

/**
 * This interface is used for every HTTP verb although not every route handler uses everything in this interface.
 * But that's fine because the specific handlers use what they need and don't touch the rest.
 * For example if the user uses the @Route() method to define a non-HTTP compliant @GET() endpoint with a request
 * payload validation the GET route-handler just ignores the request payload AND the validation.
 * This prevents the user from developing non HTTP and REST compliant APIs
 */
export interface CompiledRouteDefinition extends BaseRouteDefinition {
  validationAndTransformation?: Schemas<
    ValidateFunction,
    ValidatorAndTransformer
  >
}

export type ViewConverter<T extends AbstractViewModel = AbstractViewModel> = (
  view: T
) => string

export interface BaseRouteDefinition {
  produces?: string
  consumes?: string
  method: string | symbol
  viewConverter?: ViewConverter
}

export interface JsonSchemaAndTransformer<
  T extends AbstractViewModel = AbstractViewModel
> {
  schema: JsonSchema
  transformer: (plain: unknown) => T
}

export interface FullRouteDefinition extends BaseRouteDefinition {
  path?: string
  httpMethod: HttpMethod
  schema?: Schemas<JsonSchema, JsonSchemaAndTransformer>
}

export interface Schemas<T = unknown, V = T> {
  body?: V
  query?: T
  params?: T
  headers?: T
}

export interface ValidatorAndTransformer<T = unknown> {
  validationFn: ValidateFunction
  transformationFn: (plain: unknown) => T
}

export type JsonSchema = Record<string, any>
