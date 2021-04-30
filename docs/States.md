# States

## The idea behind the states

In Rosmarin each endpoint is understood as a state of the application. This design fits very well with the 
REST architectural style, which sees an application as a finite state machine.
Each state is implemented in its own class. This design allows specifying a workflow for the developer to follow in 
order for the resulting API to be compliant with all REST constraints.
Rosmarin offers abstract base classes for all types of states. The concrete implementation then only needs to implement 
some methods. The rest of the logic is handled in the abstract base classes. However, each concrete implementation can 
also change and redefine the flow in a very customizable way, so that the developer still has all possibilities.

## Concrete implementation

For each of the four HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`) there are abstract base classes which will be explained here.
Each of these abstract classes inherits from the same class `AbstractState`.

### AbstractState

#### Properties

##### logger

Pino Logger instance that can be used within the state. Each state instance has its own logger instance.

##### req

Fastify request instance. Mainly ssed to access Body, Params, Query Parameter and Headers.

##### response

HTTP response instance. Provides methods to set HTTP compliant status codes and headers. This is a wrapper around a 
fastify request.

##### authenticationInfoProvider

Injected provider that authenticates the user which sent the current request. See TODO for more details.

##### apiKeyInfoProvider

Injected provider that checks the API Key of the current request. See TODO for more details.

##### authenticationInfo

After method [verifyRolesOfClient](#verifyRolesOfClient) this object contains information about the user that has sent 
this request.

##### allowedRoles

Roles object. Used to set specific roles that are required to access this state. Roles are extracted from 
[authenticationInfo](#authenticationInfo).

##### apiKeyHeader

Contains information if provided API key is valid.

#### Methods

##### configure

Used by every state to pass the request and response object from the controller layer to the state.

##### buildInternal

Abstract method that implements the classes for the respective HTTP verbs. This defines the HTTP verb specific workflow.

##### configureState

This method must be used to configure the state. This includes the `stateEntryConstraints`, `allowed user roles`, 
`API key verification` activation, `caching`, `user authentication` activation.

```typescript
import { AbstractState } from './abstract-state'

@State()
class MyState extends AbstractState {
  
  protected configureState(): void {
    // API key verification is now activated
    this.activateApiKeyCheck()
    
    // authentication is now activated 
    // if you want to use the `authenticationInfo` property the authentication must be activated
    this.activateUserAuthentication()
    
    // if this condition returns false, the state will send a 403 response to the client
    this.addStateEntryConstraint(() => this.req.headers['x-custom-header'] === 'random value')
  } 
}
```

##### verifyRolesOfClient

Returns true if user is allowed to access the state based on his roles.

##### build

Only method, besides the [configure](#configure) method, that is called from outside the state. Starts the processing of 
the request.

##### verifyApiKey

Returns `true if provided API key is valid.

##### extractFromRequest

In this methods all necessary information should be extracted from the request object.

```typescript
import { AbstractState } from './abstract-state'

@State()
class MyState extends AbstractState {
  
  protected extractFromRequest(): void {
    this.id = this.extractNumberFromParams('id', 1, {  throwIfUndefined: true })
    this.searchBy = this.extractFromQuery('search', '')
  } 
}
```

##### extractFrom

Extracts the necessary information from the request headers, params oder query params. It must be specified to which type 
the extracted value should be transformed. Additionally, it can be configured that the method throws a HttpError if
the extracted value is `undefined` and it can be passed a validation function.


```typescript
const size = this.extractFrom('query', 'size', 'number', 10, {
  throwIfUndefined: true,
  validate: function(size: number) { 
    if (size < 0)
      throw new HttpError(400, 'Size cannot be less than 0.')
  }
})
```

This method should not be used directly. It is better to call the helper methods that use this method internally.
e.g: `extractNumberFromQuery()` These helper methods should be called inside the [extractFromRequest](#extractFromRequest) method.

##### addLink

Adds a link header to the HTTP response. A uri template can be passed that is filled with the provided params.

```typescript
this.addLink('/users/{}/friends/{}', 'getFriendOfUser', 'application/vnd.friend+json', [453, 2394] )
```

##### addConstrainedLink

Only adds the given link if the constraint returns `true`.

```typescript
// only adds links if the current user requests its own profile
this.addConstrainedLink(
  () => this.requestedId == this.authenticationInfo.userMode.id, 
  '/users/{}', 
  'getOwnProfile', 
  'application/vnd.user-admin+json',
  [this.requestedId]
)
```

##### activateApiKeyCheck

Activates the API key verification. This should be called inside the [configureState](#configureState) method

### AbstractStateWithCaching

This state extends the class `AbstractState` with utilities to define the caching behaviour of the particular resource.

#### Properties

##### cachingType

Type of caching behaviour. `VALIDATION_ETAG`, `VALIDATION_TIMESTAMP`, `EXPIRES_TIME` or `DEACTIVATE_CACHE`.

##### cacheControlConfigurationSet

Set of Cache-Control directives. `PRIVATE`, `PUBLIC`, `MUST_REVALIDATE`, `NO_CACHE` or `NO_STORE`. These are set via the
[setHttpCachingType](#setHttpCachingType) method.

See [RFC 7234](https://tools.ietf.org/html/rfc7234#section-5.2.2) for details.

#### Methods

##### maxAgeInSeconds

Sets the `max-age` directive of the Cache-Control header. If the given value is below zero, the default value zero is set.

##### sMaxAgeInSeconds

Sets the `s-maxage` directive of the Cache-Control header. If the given value is below zero, the default value zero is set.
 
##### defineModelForCaching

Used to specify the resource for which the caching behavior must be defined.

##### setHttpCachingType

This method will be called inside the [configureState](#configureState) method to define the caching behaviour.

```typescript
import { AbstractState } from './abstract-state-with-caching'
import { CacheControlConfiguration } from "./cache-control-configuration";

@State()
class MyState extends AbstractStateWithCaching {

  protected configureState(): void {
    // with these 2 lines the Cache-Control header 'private, must-revalidate, max-age=3600' is set and the ETag header is also set
    this.maxAgeInSeconds = 3600
    this.setHttpCachingType(
      CachingType.VALIDATION_ETAG,
      CacheControlConfiguration.PRIVATE,
      CacheControlConfiguration.MUST_REVALIDATE
    )
  }
}
```

### AbstractGetState

This abstract class forms the basis for all states that process a GET request. Since a state is always linked to a 
resource, the model that models the resource must be specified as a generic parameter. See the example below.

#### Properties

##### requestedId

Identifier of the requested resource. Is type of string or number.

##### requestedModel

Database result containing either the requested resource, if any, or the error that occurred.
See [Results](Results.md) for more details. 

#### Methods

##### buildInternal 

Implements the abstract method [buildInternal()](#buildInternal) from `AbstractState`.
In this method, the specific workflow is defined. For example `configureState()`, `extractFromRequest()` and
`loadModelFromDatabase()` are called inside this method.

Look into the source code for more details.

##### defineTransitionLinks

Here all possible state transitions should be defined, which then appear as link header in the response.
See the example below. This method *MUST* be implemented by all sub-classes.

##### loadModelFromDatabase

with this method the property [requestedModel](#requestedModel) is set. This is where the interaction with the database 
layer takes place.

#### Example

```typescript
import { AbstractState } from './get/abstract-get-state'
import { AbstractModel } from './abstract-model'

class MyModel extends AbstractModel {
  test: string
}

@State()
class MyGetState extends AbstractGetState<MyModel> {
  // injected via the dependency injection container
  // see DependencyInjection.md for more details
  constructor(private myRepository?: MyRepository) {
    super()
  }

  protected defineTransitionLinks(): Promise<void> | void {
    this.addLink('/models', 'getAllModels', 'application/vnd.model+json')
    this.addConstraintedLink(
      () => this.authenticationInfo.roles.includes('admin'),
      '/serectModels/{}',
      'getSerectModel',
      'application/vnd.serect-model+json',
      [this.secretId]
    )
  }

  protected loadModelFromDatabase(): Promise<SingleModelDatabaseResult<MyModel>> {
    return this.myRepository.readById(this.requestedId.toString())
  }

  protected configureState(): void {
    this.setHttpCachingType(
      CachingType.VALIDATION_ETAG,
      CacheControlConfiguration.PRIVATE
    )
    this.maxAgeInSeconds = 3600
  }
}
```
