import { FastifyRequest } from 'fastify'

/**
 * Wraps the authentication header from a Fastify request to provide a clean interface to interact with
 */
export class AuthenticationHeader {
  public principal = ''

  public credential = ''

  public readonly token: string

  public readonly authHeader: string

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
      this.authHeader = undefined
    } else if (
      typeof principalOrTokenOrRequest === 'string' &&
      typeof credential === 'string'
    ) {
      this.credential = credential
      this.principal = principalOrTokenOrRequest as string
    } else if (
      typeof principalOrTokenOrRequest === 'string' &&
      typeof credential === 'undefined'
    ) {
      this.token = principalOrTokenOrRequest
    } else {
      const request: FastifyRequest = principalOrTokenOrRequest as FastifyRequest
      this.authHeader = request.headers.authorization

      if (this.authHeader !== undefined) {
        if (
          this.authHeader.startsWith('Basic ') ||
          this.authHeader.startsWith('basic ')
        ) {
          const withoutBasic: string = this.authHeader.replace(/[Bb]asic /, '')
          const userColonPass: string = Buffer.from(
            withoutBasic,
            'base64'
          ).toString('utf-8')
          const asArray: string[] = userColonPass.split(':')

          if (asArray.length === 2) {
            this.principal = asArray[0]
            this.credential = asArray[1]
          }
        } else {
          this.token = this.authHeader.replace(/[Bb]earer /, '')
        }
      }
    }
  }

  public isSet(): boolean {
    return this.authHeader !== undefined
  }

  public isTokenAuthentication(): boolean {
    return !!this.token
  }
}
