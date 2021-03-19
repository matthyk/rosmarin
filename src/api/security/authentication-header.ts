import { FastifyRequest } from 'fastify'

/**
 * Wraps the authentication header from a Fastify request to provide a clean interface to interact with
 */
export class AuthenticationHeader {
  private _principal = ''

  private _credential = ''

  private readonly _token: string

  private readonly _authHeader: string

  constructor()
  constructor(token: string)
  constructor(req: FastifyRequest)
  constructor(principal: string, credential: string)
  constructor(
    principalOrTokenOrRequest?: string | FastifyRequest,
    credential?: string
  ) {
    if (
      typeof principalOrTokenOrRequest === 'undefined' &&
      typeof credential === 'undefined'
    ) {
      this._authHeader = undefined
    } else if (
      typeof principalOrTokenOrRequest === 'string' &&
      typeof credential === 'string'
    ) {
      this._credential = credential
      this._principal = principalOrTokenOrRequest as string
    } else if (
      typeof principalOrTokenOrRequest === 'string' &&
      typeof credential === 'undefined'
    ) {
      this._token = principalOrTokenOrRequest
    } else {
      const request: FastifyRequest = principalOrTokenOrRequest as FastifyRequest
      this._authHeader = request.headers.authorization

      if (this._authHeader !== undefined) {
        if (
          this._authHeader.startsWith('Basic ') ||
          this._authHeader.startsWith('basic ')
        ) {
          const withoutBasic: string = this._authHeader.replace(/[Bb]asic /, '')
          const userColonPass: string = Buffer.from(
            withoutBasic,
            'base64'
          ).toString('utf-8')
          const asArray: string[] = userColonPass.split(':')

          if (asArray.length === 2) {
            this._principal = asArray[0]
            this._credential = asArray[1]
          }
        } else {
          this._token = this._authHeader.replace(/[Bb]earer /, '')
        }
      }
    }
  }

  public get principal(): string {
    return this._principal
  }

  public get credential(): string {
    return this._credential
  }

  public get token(): string {
    return this._token
  }

  public get authHeader(): string {
    return this._authHeader
  }

  public isSet(): boolean {
    return this._authHeader !== undefined
  }

  public isTokenAuthentication(): boolean {
    return !!this._token
  }
}
