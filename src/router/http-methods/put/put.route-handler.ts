import { CompiledRouteDefinition } from '../../route-definitions'
import { RouteHandlerMethod } from 'fastify/types/route'
import { FastifyReply, FastifyRequest } from 'fastify'
import { ContentNegotiator } from './put.content-negotiator'
import { HttpResponse } from '../../http-response'
import { handleError, sendErrorResponse } from '../../http-error-handling'
import { AbstractPutState, Configured } from '../../../api'
import { AbstractModel, AbstractViewModel } from '../../../models'
import { validate, validateAndTransform } from '../../validation'
import constants from '../../../constants'

export const putRouteHandler = (
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
        req.headers['content-type'],
        req.headers.accept
      )

      validateAndTransform(
        req,
        negotiationResult.validationAndTransformation.body
      )

      validate(
        req,
        'params',
        negotiationResult.validationAndTransformation.params
      )

      validate(
        req,
        'query',
        negotiationResult.validationAndTransformation.query
      )

      req.acceptedMediaType = negotiationResult.produces

      const httpResponse: HttpResponse = new HttpResponse(reply)

      const configured: Configured<
        AbstractPutState<AbstractModel, AbstractViewModel>
      > = await controller[negotiationResult.method](req, httpResponse)

      await configured.state.build()

      if (httpResponse.isError === false) {
        if (typeof httpResponse.entity === 'undefined') {
          reply.removeHeader('content-type')
          reply.send()
        } else {
          reply
            .type(negotiationResult.produces ?? constants.DEFAULT_MEDIA_TYPE)
            .serializer(negotiationResult.viewConverter ?? JSON.stringify)
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
