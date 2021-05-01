# Dependency Injection

Rosmarin uses TSyringe as dependency injection container. Read more [here](https://github.com/Microsoft/tsyringe). \
Apart from the fact that the container is used by Rosemary, the developer can use it quite freely.

The container is used e.g. to inject the AuthenticationProvider into the state. To make this possible each state must be 
annotated with the `@State` decorator.

```typescript
import { AbstractState } from "./abstract-state";

@State() // super important !
class MyState extends AbstractState {}
```

However, this also gives the developer the possibility to use his own injectable within the class. However, there are a 
few things that need to be taken into consideration. On the one hand, only constructor injection is supported and on the 
other hand, each constructor argument must be specified as optional (see example below).

```typescript
import { singleton } from "tsyringe";

@singleton()
class MyRepository {

}

@State()
class MyState extends AbstractState {

  constructor(private readonly repository?: MyRepository) { // super important to make this optinal via '?'
    super()
  }
}
```
If you want to know why, feel free to read on, otherwise you're done here. 

TSyringe has the awesome decorator [`@autoInjectable`](https://github.com/Microsoft/tsyringe#autoinjectable).
With this, the actual constructor is replaced with a parameterless one, but with all dependencies resolved automatically.

This has the great advantage that we can simply do this in the controller

```typescript
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
}
```

instead of

```typescript
@Controller( '/users' )
class MyController {

  constructor(private readonly postUserState: PostUserState) {
  }

  @Post<PostUserState>( {
    consumes: 'application/vnd.user+json',
    schema: {
      body: buildValidatorAndTransformer( CreateUserView )
    }
  } )
  public postUser(request: HttpRequest, response: HttpResponse): Configured<PostUserState> {
    return this.postUserState.configure(req, res)
  }
}
```
