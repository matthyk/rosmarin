import { HttpMethod } from './http-method'
import { ValidateFunction } from 'ajv'

export interface BaseRouteDefinition {
  produces?: string[]
  consumes?: string[]
  method: string | symbol
}

export interface Schemas<T> {
  body?: T
  query?: T
  params?: T
  headers?: T
}

export interface RouteDefinition extends BaseRouteDefinition {
  path?: string
  httpMethod: HttpMethod
  schema?: Schemas<Record<string, unknown>>
  outputSchema?: Schemas<Record<string, unknown>>
}

export interface RouteDefinitionWithValidationFn extends BaseRouteDefinition {
  validationFns?: Schemas<ValidateFunction>
}

export type test = RouteDefinition & BaseRouteDefinition & { id: number }
