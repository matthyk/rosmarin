export class HttpResponse {
  private _statusCode: number
  private _entity: unknown | undefined
  private _headers: Record<string, string[]> = {}

  private constructor(statusCode: number, entity?: unknown) {
    this._statusCode = statusCode
    this._entity = entity
  }

  public get statusCode(): number {
    return this._statusCode
  }

  public set statusCode(value: number) {
    this._statusCode = value
  }

  public get entity(): unknown | undefined {
    return this._entity
  }

  public set entity(entity: unknown | undefined) {
    this._entity = entity
  }

  public get headers(): Record<string, string[]> {
    return this._headers
  }

  public set headers(value: Record<string, string[]>) {
    this._headers = value
  }

  public static ok(entity?: unknown): HttpResponse {
    return new HttpResponse(200, entity)
  }

  public static created(entity?: unknown): HttpResponse {
    return new HttpResponse(201, entity)
  }

  public static noContent(): HttpResponse {
    return new HttpResponse(201)
  }

  public static notModified(): HttpResponse {
    return new HttpResponse(304)
  }

  public static badRequest(error?: unknown): HttpResponse {
    return new HttpResponse(400, error)
  }

  public static unauthorized(error?: unknown): HttpResponse {
    return new HttpResponse(401, error)
  }

  public static forbidden(error?: unknown): HttpResponse {
    return new HttpResponse(403, error)
  }

  public static notFound(error?: unknown): HttpResponse {
    return new HttpResponse(404, error)
  }

  public static notAcceptable(error?: unknown): HttpResponse {
    return new HttpResponse(406, error)
  }

  public static unsupportedMediaType(error?: unknown): HttpResponse {
    return new HttpResponse(415, error)
  }

  public header(key: string, value: string): HttpResponse {
    key in this._headers
      ? this._headers[key].push(value)
      : (this._headers[key] = [value])
    return this
  }

  public link(link: string): HttpResponse {
    this.header('Link', link)
    return this
  }
}
