import 'reflect-metadata'
import { buildViewConverter, Controller, Get } from './router'
import { HttpRequest } from './router/http-request'
import { HttpResponse } from './router/http-response'
import {
  AbstractGetState,
  CacheControlConfiguration,
  CachingType,
  Configured,
  link,
  Link,
  viewProp,
} from './api'
import { LoginState } from './api/states/login-state'
import { Login } from './router/decorators'
import { AbstractUserModel } from './models/abstract-user-model'
import { IUserRepository } from './database/repositories/user.repository'
import { AbstractViewModel, ModelId } from './models'
import { SingleModelDatabaseResult } from './database'
import { hash } from 'bcrypt'
import { UserRepository } from './database/database.decorators'
import { RestApplication } from './rest-application'
import { container } from 'tsyringe'
import constants from './constants'

class UserView extends AbstractViewModel {
  @viewProp()
  password: string

  @viewProp()
  lastModifiedAt: number
}

class MyState extends AbstractGetState<MyUserModel> {
  private readonly repo: MyUserRepository

  constructor() {
    super()
    this.repo = container.resolve(constants.USER_REPOSITORY)
  }

  protected defineTransitionLinks(): Promise<void> | void {}

  protected loadModelFromDatabase(): Promise<
    SingleModelDatabaseResult<MyUserModel>
  > {
    return this.repo.readUserById(12)
  }

  protected configureState(): void {
    super.configureState()
    // this.activateUserAuthentication()
    this.setHttpCachingType(
      CachingType.VALIDATION_ETAG,
      CacheControlConfiguration.PRIVATE
    )
  }
}

class MyUserModel extends AbstractUserModel {
  @link('/users/{id}', 'self', 'application/json')
  self: Link
}

@UserRepository
export class MyUserRepository implements IUserRepository<MyUserModel> {
  public async readUserById(
    id: ModelId
  ): Promise<SingleModelDatabaseResult<MyUserModel>> {
    const user = new MyUserModel()
    user.id = id
    user.password = await hash('abc', 10)
    user.lastModifiedAt = 238545345
    user.roles = ['admin', 'test']
    return new SingleModelDatabaseResult(user)
  }

  public async readUserByPrincipal(
    _principal: string
  ): Promise<SingleModelDatabaseResult<MyUserModel>> {
    const user = new MyUserModel()
    user.id = 13
    user.password = await hash('abc', 10)
    user.lastModifiedAt = 238545345
    user.roles = ['admin', 'test']
    return new SingleModelDatabaseResult(user)
  }
}

@Controller()
class MyController {
  @Login()
  public async login(
    req: HttpRequest,
    reply: HttpResponse
  ): Promise<Configured<LoginState>> {
    return new LoginState().configure(req, reply)
  }

  @Get<MyUserModel, MyState>({
    path: '/:id',
    produces: 'application/json',
    viewConverter: buildViewConverter(MyUserModel, UserView),
  })
  public async getUser(
    req: HttpRequest,
    reply: HttpResponse
  ): Promise<Configured<MyState>> {
    return new MyState().configure(req, reply)
  }
}

const app = new RestApplication()

app.register(MyController)

app.start()
