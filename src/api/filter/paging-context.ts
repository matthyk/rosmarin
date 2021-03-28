import { FastifyRequest } from 'fastify'
import { HttpResponse } from '../../routing/http-response'

export class PagingContext {
  private readonly _req: FastifyRequest

  private readonly _response: HttpResponse

  private readonly _mediaType: string

  constructor(req: FastifyRequest, response: HttpResponse, mediaType: string) {
    this._req = req
    this._response = response
    this._mediaType = mediaType
  }

  public get req(): FastifyRequest {
    return this._req
  }

  public get response(): HttpResponse {
    return this._response
  }

  public get mediaType(): string {
    return this._mediaType
  }
}
