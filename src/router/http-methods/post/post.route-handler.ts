import { CompiledRouteDefinition } from '../../route-definitions'
import { RouteHandlerMethod } from 'fastify/types/route'
import { FastifyReply, FastifyRequest } from 'fastify'
import { HttpResponse } from '../../http-response'
import { handleError } from '../../error-handler'
import { AbstractPostState } from '../../../api/states/post/abstract-post-state'
import { ViewModel } from '../../../api/abstract-view-model'
import { AbstractModel } from '../../../api/abstract-model'
import { Configured } from '../../../api/states/configured'
import { ContentNegotiator } from './post.content-negotiator'
import { validateAndTransform } from '../../validation'
import { sendErrorResponse } from '../send-error-reponse'

export const postRouteHandler = (
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
        req.headers['content-type']
      )

      validateAndTransform(
        req,
        'body',
        negotiationResult.validationAndTransformation.body
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
        AbstractPostState<AbstractModel, ViewModel>
      > = await controller[negotiationResult.method](req, httpResponse)

      await configured.state.build()

      if (httpResponse.isError === false) {
        reply.removeHeader('content-type')
        reply.send()
      } else {
        sendErrorResponse(reply, httpResponse.entity)
      }
    } catch (e: unknown) {
      handleError(e, req, reply)
    }
  }
}
