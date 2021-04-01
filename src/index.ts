/*
import 'reflect-metadata'
import { FastifyRequest } from 'fastify'
import { Controller, Get, Router } from './router'
import { HttpResponse } from './router/http-response'
import Pino, { Logger } from 'pino'
import { container, injectable } from 'tsyringe'
import constants from './api/constants'
import { AbstractGetState } from './api/states/get/abstract-get-state'
import { AbstractModel } from './api/abstract-model'
import { SingleModelDatabaseResult } from './database/results/single-model-database-result'
import { State } from './api/states/decorator'
import { AuthenticationInfo } from './api/security/authentication-info'
import { AuthenticationHeader } from './api/security/authentication-header'
import { AuthenticationInfoProvider } from './api/security/authentication-info-provider'
import { NoApiKeyProvider } from './api/api-key/no-api-key-provider'
import { CachingType } from './api/caching/caching-type'
import { CacheControlConfiguration } from './api/caching/cache-control-configuration'
import { Roles } from './api/security/roles'
import { Role } from './api/security/role'
import { AuthenticationInfoTokenToRespond } from './api/security/authentication-info-token-to-respond'
import { convertTo, prop } from './api/views/view-converter'

const logger: Logger = Pino({
  level: 'debug',
  prettyPrint: true,
})

class MyAuthProvider implements AuthenticationInfoProvider {
  public async get(
    authenticationHeader: AuthenticationHeader
  ): Promise<AuthenticationInfo> {
    const user: User = new User('ahah', 'sdas')
    user.id = 23

    const authInfo: AuthenticationInfo = new AuthenticationInfo(
      authenticationHeader.principal,
      authenticationHeader.credential,
      ['defaultUser'],
      user
    )

    if (!authenticationHeader.isTokenAuthentication()) {
      authInfo.tokenToRespond = new AuthenticationInfoTokenToRespond(
        'Authorization',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTYxMDUzOTI4MiwiZXhwIjoxNjEwNTQyODgyfQ.zHtOhccxlXu8xsiSDPsjPpYb4YMDZQ8GZGScAkUQPhI'
      )
    }

    return authInfo
  }
}

container.registerInstance(constants.LOGGER, logger)
container.register(constants.API_KEY_INFO_PROVIDER, NoApiKeyProvider)
container.register(constants.AUTHENTICATION_INFO_PROVIDER, MyAuthProvider)

class User extends AbstractModel {
  public name: string
  public password: string

  constructor(name: string, password: string) {
    super()
    this.name = name
    this.password = password
  }
}

class UserView extends AbstractModel {
  @prop
  name: string

  @prop
  password: string
}

@State()
class GetSingleUser extends AbstractGetState<User> {
  protected async defineTransitionLinks(): Promise<void> {
    await this.addConstrainedLink(async () => true, '/users', 'allUsers')
    await this.addConstrainedLink(
      async () => true,
      '/users/{}',
      'allUsers',
      'application/vnd.user+json',
      ['juhu']
    )
    this.addLink('/users/{}', 'updateUser', 'application/vnd.user+json', [13])
    this.addLink('/users/{}/friends/{}', 'getBestFriend', 'hahahaha', [12, 78])
  }

  protected async loadModelFromDatabase(): Promise<
    SingleModelDatabaseResult<User>
  > {
    const user = new User('matthi', 'abc123')
    user.lastModifiedAt = 10
    return new SingleModelDatabaseResult<User>(user)
  }

  protected configureState(): void {
    this.allowedRoles = new Roles(new Role('defaultUser', true))

    this.activateUserAuthentication()

    this.setHttpCachingType(
      CachingType.EXPIRES_TIME,
      CacheControlConfiguration.PRIVATE
    )
    this.maxAgeInSeconds = 3600
  }
}

@Controller('/users')
@injectable()
class UserController {
  constructor(private readonly state: GetSingleUser) {}

  @Get<{ Params: { id: number } }>({
    path: '/:id',
    produces: 'application/vnd.user+json',
  })
  public async getUser(
    req: FastifyRequest<{ Params: { id: number } }>,
    response: HttpResponse
  ): Promise<HttpResponse> {
    this.state.configure(req, response)
    this.state.requestedId = req.params.id
    // this.state.converter = convertTo<User, UserView>(UserView)
    return this.state.build()
  }
}

;(async function start() {
  const router: Router = new Router(logger)

  router.registerControllers(UserController)

  await router.listen()
})()
*/
