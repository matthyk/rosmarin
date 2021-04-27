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

##### verifyRolesOfClient

Returns true if user is allowed to access the state based on his roles.

##### build

Only method, besides the [configure](#configure) method, that is called from outside the state. Start the processing of 
the request.

##### verifyApiKey

Returns `true if provided API key is valid.

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
e.g: `extractNumberFromQuery()` These helper methods should be called inside the `extractFromRequest` method.

##### addLink

Adds a link header to the HTTP response. A uri template can be passed that is filled with the provided params.

```typescript
this.addLink('/users/{}/friends/{}', 'getFriendOfUser', 'application/vnd.friend+json', [453, 2394] )
```

### GET

#### Abstract

