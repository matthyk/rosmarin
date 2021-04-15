import { FastifyRequest } from 'fastify'
import { RouteGenericInterface } from 'fastify/types/route'
import {
  RawRequestDefaultExpression,
  RawServerBase,
  RawServerDefault,
} from 'fastify/types/utils'

/**
 * Use HttpRequest instead of FastifyRequest to have a clean interface for improvements in the future
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HttpRequest<
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
  RawServer extends RawServerBase = RawServerDefault,
  RawRequest extends RawRequestDefaultExpression<RawServer> = RawRequestDefaultExpression<RawServer>
> extends FastifyRequest<RouteGeneric, RawServer, RawRequest> {}
