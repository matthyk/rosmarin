import { HttpRequest } from './http-request'
import { HttpResponse } from './http-response'
import { Configured } from '../api'
import { Target } from '../types'
import { HttpMethod } from './http-methods'
import { FullRouteDefinition } from './route-definitions'

export type TypedMethodDecorator<T> = (
  target: Target,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T>

export type ReturnsConfiguredState<State> = (
  request: HttpRequest,
  response: HttpResponse
) => Configured<State>

export type RouteStore = Record<
  string,
  Record<HttpMethod, FullRouteDefinition[]>
>
