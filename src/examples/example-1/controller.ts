import { HttpRequest } from '../../router/http-request'
import { HttpResponse } from '../../router/http-response'
import { GetSingleUser } from './states/get-single-user'
import { Configured } from '../../api/states/configured'
import { Controller, Route } from "../../router/decorators";

@Controller('/users')
export class UserController {
  /*
  @Post<UserModel, CreateUserView, PostUser>({
    consumes: 'application/vnd.user+json',
    schema: {
      body: CreateUserView
    }
  })
  public async postNewUser(request: HttpRequest<CreateUserView>, response: HttpResponse): Promise<PostUser> {
    this.postUser.configure(request, response)
    this.postUser.modelToCreate = request.body
    return this.postUser
  }
  */
  @Route({
    httpMethod: 'PATCH',
  })
  public async getUser(
    request: HttpRequest,
    response: HttpResponse
  ): Promise<Configured<GetSingleUser>> {
    return new GetSingleUser().configure(request, response)
  }

  /*
  @GetCollection<UserModel, GetAllUsers>({
    produces: 'application/vnd.user+json',
    outputSchema: {
      type: 'array',
      items: {
        type: "object",
        properties: {
          name: {
            type: "string"
          },
          id: {
            $ref: 'id'
          },
          self: {
            $ref: 'link'
          },
          friends: {
            $ref: 'link'
          },
          location: {
            type: 'object',
            properties: {
              id: {
                $ref: 'id'
              },
              city: {
                type: "string"
              },
              street: {
                type: "string"
              }
            }
          }
        }
      }
    }
  })
  public async getAllUsers(request: HttpRequest<never, { Params: { id: string } }>, response: HttpResponse): Promise<GetAllUsers> {
    this.getAll.configure(request, response)
    return this.getAll
  }

  @Put<UserModel, UpdateUserView, UpdateUser>({
    path: '/:id',
    consumes: 'application/vnd.user+json',
    schema: {
      body: UpdateUserView
    }
  })
  public async updateSingleUser(request: HttpRequest<UpdateUserView, { Params: { id: string } }>, response: HttpResponse): Promise<UpdateUser> {
    this.updateUser.configure(request, response)
    this.updateUser.modelToUpdate = request.body
    return this.updateUser
  }

  @Delete<UserModel, DeleteUser>({
    path: '/:id',
    produces: 'application/vnd.user+json',
    outputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string"
        },
        id: {
          $ref: 'id'
        },
        self: {
          $ref: 'link'
        },
        friends: {
          $ref: 'link'
        },
        location: {
          type: 'object',
          properties: {
            id: {
              $ref: 'id'
            },
            city: {
              type: "string"
            },
            street: {
              type: "string"
            }
          }
        }
      }
    }
  })
  public async deleteSingleUser(request: HttpRequest<UpdateUserView, { Params: { id: string } }>, response: HttpResponse): Promise<Configured<DeleteUser>> {
   return new DeleteUser().configure(request, response)
  }

  @Get<UserModel, VerySimpleGet>({
    path: '/test',
    produces: 'application/json'
  })
  public async simpleGet(request: HttpRequest, response: HttpResponse): Promise<Configured<VerySimpleGet>> {
    return new VerySimpleGet().configure(request, response)
  }
   */
}
