import { FastifyReply, FastifyRequest } from 'fastify'
import { CacheControl } from '../api/caching/cache-control'

const errorCacheControl: CacheControl = new CacheControl()
errorCacheControl.noCache = true
errorCacheControl.noStore = true
errorCacheControl.noTransform = true

const errorCacheControlString: string = errorCacheControl.toString()

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
    reply
      .header('Cache-Control', errorCacheControlString)
      .status(415)
      .send(error)
    return
  }

  request.log.error(
    `An unexpected error has occurred that has not been catched.\n${error.stack}`
  )

  reply
    .header('Cache-Control', errorCacheControlString)
    .header('Content-Type', 'application/vnd.error+json')
    .status(500)
    .send(defaultError)
}

export { errorCacheControl, errorHandler, defaultError }
