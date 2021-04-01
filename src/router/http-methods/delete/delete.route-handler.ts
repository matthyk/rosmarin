import { CompiledRouteDefinition } from '../../route-definitions'
import { RouteHandlerMethod } from 'fastify/types/route'
import { FastifyReply, FastifyRequest } from 'fastify'
import { ContentNegotiator } from './delete.content-negotiator'
import { HttpResponse } from '../../http-response'
import { handleError } from '../../error-handler'
import { AbstractDeleteState } from '../../../api/states/delete/abstract-delete-state'
import { AbstractModel } from '../../../api/abstract-model'
import { Configured } from '../../../api/states/configured'
import { sendErrorResponse } from '../send-error-reponse'
import { validateAndTransform } from '../../validation'

export const deleteRouteHandler = (
  routeDefinitions: CompiledRouteDefinition[],
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  controller: any
): RouteHandlerMethod => {
  const contentNegotiator: ContentNegotiator = new ContentNegotiator(
    routeDefinitions
  )

  return async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const negotiationResult: CompiledRouteDefinition = contentNegotiator.retrieveHandler(
        req.headers.accept
      )

      validateAndTransform(
        req,
        'params',
        negotiationResult.validationAndTransformation.params
      )

      validateAndTransform(
        req,
        'query',
        negotiationResult.validationAndTransformation.query
      )

      req.acceptedMediaType = negotiationResult.produces

      const httpResponse: HttpResponse = new HttpResponse(reply)

      const configuredState: Configured<
        AbstractDeleteState<AbstractModel>
      > = await controller[negotiationResult.method](req, httpResponse)

      await configuredState.state.build()

      if (httpResponse.isError === false) {
        if (typeof httpResponse.entity === 'undefined') {
          reply.removeHeader('content-type')
          reply.send()
        } else {
          reply
            .type(negotiationResult.produces ?? 'application/json')
            .serializer(negotiationResult.stringifyFn)
            .send(httpResponse.entity)
        }
      } else {
        sendErrorResponse(reply, httpResponse.entity)
      }
    } catch (e: unknown) {
      handleError(e, req, reply)
    }
  }
}
