import { FastifyReply, FastifyRequest } from 'fastify'
import { CacheControl } from './cache-control'

const errorCacheControl: string = new CacheControl().noCache.noStore.toString()
const defaultError = {
  statusCode: 500,
  error: 'Internal Server Error',
  message: 'An unexpected error occurred.',
}

const errorHandler = (
  error: any, // TODO: replace any
  request: FastifyRequest,
  reply: FastifyReply
): void => {
  if (error.code === 'FST_ERR_CTP_INVALID_MEDIA_TYPE') {
    delete error.code
    reply.header('Cache-Control', errorCacheControl).status(415).send(error)
    return
  }

  request.log.error(
    `An unexpected error has occurred that has not been catched.\n${error.stack}`
  )

  reply
    .header('Cache-Control', errorCacheControl)
    .header('Content-Type', 'application/vnd.error+json')
    .status(500)
    .send(defaultError)
}

export { errorCacheControl, errorHandler, defaultError }
