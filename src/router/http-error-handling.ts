import { FastifyReply, FastifyRequest } from 'fastify'
import { CacheControl } from '../api/caching'
import { RouterError } from './errors/router-error'
import { serializeErrorResponse } from './serialization'
import { HttpError } from './errors/http-error'

const cacheControl: CacheControl = new CacheControl()
cacheControl.noCache = true
cacheControl.noStore = true
cacheControl.noTransform = true

const errorCacheControl: string = cacheControl.toString()

const errorMediaType = 'application/vnd.error+json'

export const handleError = (
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  error: any,
  request: FastifyRequest,
  reply: FastifyReply
): void => {
  if (error instanceof RouterError || error instanceof HttpError) {
    reply
      .header('Cache-Control', errorCacheControl)
      .status(error.status)
      .type(errorMediaType)
      .serializer(serializeErrorResponse)
      .send(error)
    return
  }

  if (error.code === 'FST_ERR_CTP_INVALID_MEDIA_TYPE') {
    delete error.code
    error.status = error.statusCode
    delete error.statusCode
    reply
      .header('Cache-Control', errorCacheControl)
      .status(415)
      .type(errorMediaType)
      .serializer(serializeErrorResponse)
      .send(error)
    return
  }

  request.log.error(`An unexpected error has occurred.\n${error.stack}`)

  reply
    .header('Cache-Control', errorCacheControl)
    .type(errorMediaType)
    .status(500)
    .serializer(serializeErrorResponse)
    .send({
      status: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred.',
    })
}

export const notFound = async (
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  reply
    .code(404)
    .header('Cache-Control', errorCacheControl)
    .serializer(serializeErrorResponse)
    .type(errorMediaType)
    .send({
      status: 404,
      error: 'Not Found',
      message: `Route { ${req.method} ${req.url} } not found.`,
    })
}

export const sendErrorResponse = (
  reply: FastifyReply,
  error: unknown
): void => {
  // Why no status code is set? Because the status code is already set in a state
  reply
    .serializer(serializeErrorResponse)
    .header('Cache-Control', errorCacheControl)
    .type(errorMediaType)
    .send(error)
}
