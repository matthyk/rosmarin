import { FastifyReply } from 'fastify'
import { IError } from '../models/error-model'
import { CacheControl } from '../api/caching/cache-control'

// Type took from https://github.com/fastify/fastify/blob/7efd2540f1ca169f128c1dd4318512347583b293/types/reply.d.ts#L36
export type Header = number | string | string[] | undefined

export class HttpResponse {
  public entity: unknown | undefined
  public isError = false

  public constructor(private readonly reply: FastifyReply) {
    this.reply.status(200)
  }

  public ok(entity?: unknown): HttpResponse {
    if (entity) this.entity = entity
    this.reply.code(200)
    return this
  }

  public created(entity?: unknown): HttpResponse {
    if (entity) this.entity = entity
    this.reply.code(201)
    return this
  }

  public noContent(): HttpResponse {
    this.reply.code(204)
    this.entity = undefined
    return this
  }

  public notModified(): HttpResponse {
    this.reply.code(304)
    this.entity = undefined
    return this
  }

  public badRequest(errorMsg: string, code?: string | number): HttpResponse {
    return this.error({
      status: 400,
      message: errorMsg,
      code: code,
      error: 'Bad Request',
    })
  }

  public unauthorized(
    errorMsg = 'Not authorized.',
    code?: string | number
  ): HttpResponse {
    return this.error({
      status: 401,
      message: errorMsg,
      code: code,
      error: 'Unauthorized',
    })
  }

  public forbidden(
    errorMsg = 'You have no power here!',
    code?: string | number
  ): HttpResponse {
    return this.error({
      status: 403,
      message: errorMsg,
      code: code,
      error: 'Forbidden',
    })
  }

  public notFound(
    errorMsg = 'This resource does not exist.',
    code?: string | number
  ): HttpResponse {
    return this.error({
      status: 404,
      message: errorMsg,
      code: code,
      error: 'Not Found',
    })
  }

  public notAcceptable(errorMsg: string, code?: string | number): HttpResponse {
    return this.error({
      status: 406,
      message: errorMsg,
      code: code,
      error: 'Not Acceptable',
    })
  }

  public preconditionFailed(
    errorMsg = '',
    code?: string | number
  ): HttpResponse {
    return this.error({
      status: 412,
      message: errorMsg,
      code: code,
      error: 'Precondition Failed',
    })
  }

  public unsupportedMediaType(
    errorMsg: string,
    code?: string | number
  ): HttpResponse {
    return this.error({
      status: 415,
      message: errorMsg,
      code: code,
      error: 'Unsupported Media Type',
    })
  }

  public internalServerError(
    errorMsg = 'An unexpected error occurred.',
    code?: string | number
  ): HttpResponse {
    return this.error({
      status: 500,
      message: errorMsg,
      code: code,
      error: 'Internal Server Error',
    })
  }

  /**
   *
   * some helper methods for common HTTP errors
   *
   */

  public apiKeyRequired(
    errorMsg = 'API key required.',
    code: string | number = 100
  ): HttpResponse {
    return this.error({
      status: 401,
      message: errorMsg,
      code: code,
      error: 'Unauthorized',
    })
  }

  private error(error: IError): HttpResponse {
    this.isError = true
    this.entity = error
    this.reply.code(error.status)
    return this
  }

  public link(link: string): HttpResponse {
    const linkHeaders: string | string[] = this.reply.getHeader('link') ?? []

    if (Array.isArray(linkHeaders)) {
      linkHeaders.push(link)
      this.reply.header('link', linkHeaders)
      return this
    }

    this.reply.header('link', [linkHeaders, link])

    return this
  }

  public header(key: string, value: Header): HttpResponse {
    this.reply.header(key, value)
    return this
  }

  public cacheControl(cacheControl: CacheControl): HttpResponse {
    this.header('cache-control', cacheControl.toString())
    return this
  }

  public lastModified(date: Date): HttpResponse {
    this.header('last-modified', date.toUTCString())
    return this
  }

  public etag(etag: string): HttpResponse {
    this.header('etag', etag)
    return this
  }

  public location(location: string): HttpResponse {
    this.header('location', location)
    return this
  }
}
