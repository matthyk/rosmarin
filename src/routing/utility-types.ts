import { HttpResponse } from './http-response'
import { FastifyRequest } from 'fastify'
import { HttpMethod } from './http-method'
import { RouteDefinition } from './route-definition'

export type TypedMethodDecorator<T> = (
  target: Target,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T>

export type ReturnsHttpResponse<T> = (
  request: FastifyRequest<T>,
  response: HttpResponse
) => Promise<HttpResponse>

// eslint-disable-next-line @typescript-eslint/ban-types
export type Constructor<T = unknown> = new (...arg: any[]) => T

export type RouteStore = Record<string, Record<HttpMethod, RouteDefinition[]>>

// eslint-disable-next-line @typescript-eslint/ban-types
export type Target = Object

export type StringifyFn = (json: unknown) => string
