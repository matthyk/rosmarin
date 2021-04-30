# Models and Views

## Models

In Rosmarin, resources are represented by models. Each model must be a sub-class of `AbstractModel`.

```typescript
abstract class AbstractModel {
  @modelProp()
  public id: ModelId

  public lastModifiedAt: number
}
```

`AbstractModel` defines 2 properties common to all resources/models. This is on the one hand the `id` property of the type 
ModelId (which is internally `string` or `number`) and on the other hand the `lastModifiedAt` property, which is needed e.g. 
for caching. Since metadata is required for the ViewConverter and the Merger, all non-primitive properties in Models 
must be annotated with the correct decorator.

Let's take a look at an example.

```typescript
import { AbstractModel } from "./abstract-model";
import { modelArrayProp, modelProp } from "./models.decorators";

class EmbeddedModel extends AbstractModel {
}

class CollectionModel extends AbstractModel {
}

class MyModel extends AbstractModel {

  /*
  You do not have to annotate primitive properties but you should do it
  You can also use the Decorator to override the type, e.g. with @modelProp(() => Number)
  */
  @modelProp()
  stringProperty: string

  /*
  The decorator must be set here.
  Rosmarin can determine the type of the property by reflection through the Decorator. 
  But you can also overwrite the type here again. 
  */
  @modelProp()
  embeddedModel: EmbeddedModel

  /*
  Here the decorator must be set and the type must be specified, because with arrays the type cannot be determined by reflection.
  */
  @modelArrayProp(() => CollectionModel)
  collectionModel: CollectionModel[]
}

```

## Views

The client will never interact directly with a model, but only with views. Views are used to create new resources and 
define different representations of a resource. 

But let's just jump right back into an example.

```typescript
import { AbstractModel } from "./abstract-model";
import { modelProp } from "./models.decorators";

class User extends AbstractModel {

  @modelProp()
  name: string

  @modelProp()
  password: string
}
```
We start by defining the resource `User` with the properties `id`, `lastModifiedAt`, `name` and `password`.
If the client now wants to create a new user, it may of course only set the 2 properties `name` and `password` and the 
properties `id` and `lastModifiedAt` are set by the server. For this we need to create a view `CreateUserView`.

```typescript
import { AbstractViewModel } from "./abstract-view-model";
import { viewProp } from "./views.decorators";

/*
In views all properties MUST be decorated.
*/
class CreateUserView extends AbstractViewModel {
  @viewProp()
  name: string

  @viewProp()
  password: string
}
```
In views, it is necessary to decorate `ALL` properties.
Rosmarin internally generates a JSON schema based on the view definition, which is used to validate the incoming data. 
If you want to define additional restrictions for individual properties, such as the maximum string length, you must 
define the JSON schema for these properties yourself.

```typescript
import { AbstractViewModel } from "./abstract-view-model";
import { viewProp } from "./views.decorators";

/*
In views all properties MUST be decorated.
*/
class CreateUserView extends AbstractViewModel {
  @viewProp()
  name: string

  @viewProp({
    type: 'string',
    maxLength: 50,
    minLength: 10
  })
  password: string
}
```

Now that we have defined a view to create a user, we would like to define one to retrieve a user.

```typescript
import { AbstractViewModel } from "./abstract-view-model";
import { viewProp } from "./views.decorators";

class UserView extends AbstractViewModel {
  @viewProp()
  name: string
}
```

Of course, we don't want the `password` to be displayed as well, which is why the view only has the property `name`.
The property `id` is included and the property `lastModifiedAt` is excluded by default.
Since the ViewConverter also uses a JSON schema internally, the JSON schema can also be adapted manually here. 
(see example above)

### Collection Views

Now, if we don't want to query a single user but a list of users, we need to define a separate view for it.
Rosmarin makes this very easy. If we assume that we want to display only the `id` and `name` of each user in the list, 
we simply need to create a new view class.

```typescript
import { AbstractViewModel } from "./abstract-view-model";
import { collectionView, viewProp } from "./views.decorators";

@collectionView()
class UserView extends UserView {}
```

Through `@collectionView`, Rosmarin registers that it is a collection view and applies the decorated class schema to each 
element in the list.

