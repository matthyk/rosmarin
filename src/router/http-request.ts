import { FastifyRequest, RequestGenericInterface } from 'fastify'
import { RouteGenericInterface } from 'fastify/types/route'

export interface HttpRequest<
  Body = never,
  RouteGeneric extends RequestGenericInterface = RouteGenericInterface
> extends FastifyRequest<RouteGeneric> {
  body: Body
}
