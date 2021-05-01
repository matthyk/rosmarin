import {
  Configured,
  Controller,
  Delete,
  Get,
  GetCollection,
  Post,
  Put,
} from '../../../src'
import { HttpRequest } from '../../../src/router/http-request'
import { HttpResponse } from '../../../src/router/http-response'
import { PostUser } from './states/post-user'
import { createUserViewSchema } from './views/create-user-view'
import { GetSingleUser } from './states/get-single-user'
import { userViewConverter } from './views/user-view'
import { GetUsers } from './states/get-users'
import { collectionUserViewConverter } from './views/collection-user-view'
import { DeleteUser } from './states/delete-user'
import { PutUser } from './states/put-user'
import { updateUserViewSchema } from './views/update-user-view'

@Controller('/users')
export class UserController {
  constructor() {}
  @Post<PostUser>({
    consumes: 'application/vnd.user+json',
    schema: {
      body: createUserViewSchema,
    },
  })
  public postUser(req: HttpRequest, res: HttpResponse): Configured<PostUser> {
    return new PostUser().configure(req, res)
  }

  @Get<GetSingleUser>({
    produces: 'application/vnd.user+json',
    viewConverter: userViewConverter,
  })
  public getSingleUser(
    req: HttpRequest,
    res: HttpResponse
  ): Configured<GetSingleUser> {
    return new GetSingleUser().configure(req, res)
  }

  @GetCollection<GetUsers>({
    produces: 'application/vnd.user+json',
    viewConverter: collectionUserViewConverter,
  })
  public getUsers(req: HttpRequest, res: HttpResponse): Configured<GetUsers> {
    return new GetUsers().configure(req, res)
  }

  @Delete<DeleteUser>()
  public deleteUser(
    req: HttpRequest,
    res: HttpResponse
  ): Configured<DeleteUser> {
    return new DeleteUser().configure(req, res)
  }

  @Put<PutUser>({
    consumes: 'application/vnd.user+json',
    schema: {
      body: updateUserViewSchema,
    },
    viewConverter: userViewConverter,
  })
  public putUser(req: HttpRequest, res: HttpResponse): Configured<PutUser> {
    return new PutUser().configure(req, res)
  }
}
