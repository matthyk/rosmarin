import { FastifyReply } from 'fastify'
import { IError } from '../error-interface'
import { CacheControl } from '../api/caching/cache-control'

export type Header = number | string | string[] | undefined

export class HttpResponse {
  private _entity: unknown | undefined
  private _isError = false

  public constructor(private readonly reply: FastifyReply) {
    this.reply.status(200)
  }

  public get entity(): unknown | undefined {
    return this._entity
  }

  public set entity(entity: unknown | undefined) {
    this._entity = entity
  }

  public get isError(): boolean {
    return this._isError
  }

  public get headers(): Record<string, Header> {
    return this.reply.getHeaders()
  }

  public set headers(value: Record<string, Header>) {
    this.reply.headers(value)
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
    errorMsg: string = 'Not authorized.',
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
    errorMsg: string = 'You have no power here!',
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
    errorMsg: string = 'This resource does not exist.',
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
    errorMsg: string = '',
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
    errorMsg: string = 'API key required.',
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
    this._isError = true
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
    this.header('Cache-Control', cacheControl.toString())
    return this
  }

  public lastModified(date: Date): HttpResponse {
    this.header('Last-Modified', date.toUTCString())
    return this
  }

  public etag(etag: string): HttpResponse {
    this.header('Etag', etag)
    return this
  }

  public location(location: string): HttpResponse {
    this.header('Location', location)
    return this
  }
}
