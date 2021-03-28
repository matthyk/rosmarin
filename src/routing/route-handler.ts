import { RouteDefinitionWithValidationFn } from './route-definition'
import { RouteHandlerMethod } from 'fastify/types/route'
import { ContentNegotiator } from './content-negotiator'
import { FastifyReply, FastifyRequest } from 'fastify'
import { validateRequest } from './validation'
import { HttpResponse } from './http-response'
import { serializeErrorResponse } from './serialization'
import { RoutingError } from './routing-error'
import { errorCacheControl, errorHandler } from './error-handler'

export const createRouteHandler = (
  routeDefinitions: RouteDefinitionWithValidationFn[],
  controller: any
): RouteHandlerMethod => {
  const contentNegotiator: ContentNegotiator = new ContentNegotiator(
    routeDefinitions
  )

  return async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const negotiationResult: RouteDefinitionWithValidationFn = contentNegotiator.retrieveHandler(
        req.headers.accept,
        req.headers['content-type']
      )

      validateRequest(req, negotiationResult.validationFns)

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      req.fullUrl = req.protocol + '://' + req.hostname + req.url
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      req.baseUrl = req.protocol + '://' + req.hostname
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      req.acceptedMediaType = negotiationResult.produces

      const httpResponse: HttpResponse = new HttpResponse(reply)

      const response: HttpResponse = await controller[negotiationResult.method](
        req,
        httpResponse
      )

      if (response.isError) {
        reply
          .serializer(serializeErrorResponse)
          .type('application/vnd.error+json')
          .send(response.entity)
      } else {
        if (negotiationResult.stringifyFn)
          reply.serializer(negotiationResult.stringifyFn)

        reply
          .type(negotiationResult.produces ?? 'application/json')
          .send(response.entity ? response.entity : undefined)
      }
    } catch (e: unknown) {
      if (e instanceof RoutingError) {
        reply
          .header('Cache-Control', errorCacheControl)
          .status(e.status)
          .send(e.toJSON())
      } else {
        errorHandler(e, req, reply)
      }
    }
  }
}
