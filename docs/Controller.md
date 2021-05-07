# Controllers

Controllers are the place where routes are registered. The basic concept is very similar to 
e.g. [NestJS](https://docs.nestjs.com/controllers), but with some differences.

```typescript
import { Controller, Post } from './controller'
import { Configured } from './state.configured'
import { AbstractViewModel } from './abstract-view-model'
import { viewProp } from "./views.decorators";
import { AbstractModel } from "./abstract-model";

class CreateUserView extends AbstractViewModel {
  @viewProp()
  name: string
}

class User extends AbstractModel {
  name: string
}

class UserView extends AbstractViewModel {
  @viewProp()
  name: string
}

@Controller( '/users' )
class MyController {

  @Post<PostUserState>( {
    consumes: 'application/vnd.user+json',
    schema: {
      body: buildValidatorAndTransformer( CreateUserView )
    }
  } )
  public postUser(request: HttpRequest, response: HttpResponse): Configured<PostUserState> {
    return new PostUserState().configure( req, res )
  }

  @Get<GetUserState>( {
    produces: 'application/vnd.user+json',
    path: '/:id',
    viewConverter: buildViewConverter(User, UserView)
  } )
  public getUser(request: HttpRequest, response: HttpResponse): Configured<GetUserState> {
    return new GetUserState().configure( req, res )
  }
}
```

As you can see above, the decorators are very strictly typed, making it very difficult to get anything wrong.
Since each endpoint is very closely related to the associated state, this state also appears in the definition of the 
endpoint.

For example, the following example would result in a compiler error because the wrong state is returned.
```typescript
@Controller( '/users' )
class MyController {

  @Post<PostUserState>( {
    consumes: 'application/vnd.user+json',
    schema: {
      body: buildValidatorAndTransformer( CreateUserView )
    }
  } )
  public postUser(request: HttpRequest, response: HttpResponse): Configured<GetUserState> {
    return new PostUserState().configure( req, res )
  }
}
```
The interface `Configured<?>` ensures that the `configure` method is called in every case.

## Route definitions

Rosmarin is very strict about how an HTTP specific route must be defined. There is a separate interface for each of the 
four HTTP verbs. The `@Post` decorator to register a `POST` route therefore only accepts the route definition provided for it.


### GET

```typescript
interface GetRouteDefinition {
  path?: string
  viewConverter: ViewConverter
  produces: string
}
```
As you can see in the interface definition, the two properties `produces` and `viewConverter` must be specified.
For `produces`, you should specify the specific media type that this endpoint/state produces.
The `viewConverter` converts the resource/model to the specific view. To build this converter use the `buildViewConverter`
method. The `path` property is optional.

### POST

```typescript
interface PostRouteDefinition {
  path?: string
  schema: Schemas<JsonSchema, JsonSchemaAndTransformer>
  consumes: string
}
```
As you can see in the interface definition, the two properties `consumes` and `schema` must be specified.
For `consumes`, you should specify the specific media type that this endpoint/state consumes.
The `schema` property accepts JSON Schema definitions to validate the incoming request body, params, headers and query parameter.
For the body you also have to provide a transformer function that transform the body from a plain object to the specific class.
This does not have to be done by yourself, but there is the function `buildValidatorAndTransformer`. 
The `path` property is optional.
