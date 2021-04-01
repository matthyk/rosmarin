import { CompiledRouteDefinition } from '../../route-definitions'
import { RouteHandlerMethod } from 'fastify/types/route'
import { FastifyReply, FastifyRequest } from 'fastify'
import { validateAndTransform } from '../../validation'
import { HttpResponse } from '../../http-response'
import { handleError } from '../../error-handler'
import { AbstractGetState } from '../../../api/states/get/abstract-get-state'
import { AbstractModel } from '../../../api/abstract-model'
import { Configured } from '../../../api/states/configured'
import { ContentNegotiator } from './get.content-negotiator'
import { sendErrorResponse } from '../send-error-reponse'

export const getRouteHandler = (
  routeDefinitions: CompiledRouteDefinition[],
  // any is bad! But we need it here because we do not know what we have here
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

      const configured: Configured<
        AbstractGetState<AbstractModel>
      > = await controller[negotiationResult.method](req, httpResponse)

      await configured.state.build()

      if (httpResponse.isError === false) {
        reply
          .serializer(negotiationResult.stringifyFn)
          .type(negotiationResult.produces)
          .send(httpResponse.entity)
      } else {
        sendErrorResponse(reply, httpResponse.entity)
      }
    } catch (e: unknown) {
      handleError(e, req, reply)
    }
  }
}
