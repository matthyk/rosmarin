import { HttpResponse } from './http-response'
import { HttpMethod } from "./http-methods"
import { FullRouteDefinition } from './route-definitions'
import { HttpRequest } from './http-request'
import { Configured } from '../api/states/configured'

export type TypedMethodDecorator<T> = (
  target: Target,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T>

export type ReturnsConfiguredState<Body, RouteGeneric, State> = (
  request: HttpRequest<Body, RouteGeneric>,
  response: HttpResponse
) => Promise<Configured<State>>

// eslint-disable-next-line @typescript-eslint/ban-types
export type Constructor<T = unknown> = new (...arg: any[]) => T

export type RouteStore = Record<
  string,
  Record<HttpMethod, FullRouteDefinition[]>
>

// eslint-disable-next-line @typescript-eslint/ban-types
export type Target = Object

export type StringifyFn = (json: unknown) => string
