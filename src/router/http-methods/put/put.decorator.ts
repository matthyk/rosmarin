import { Schemas } from '../../route-definitions'
import {
  Constructor,
  ReturnsConfiguredState,
  TypedMethodDecorator,
} from '../../utility-types'
import { Route } from '../../decorators/route'
import { AbstractPutState } from '../../../api/states/put/abstract-put-state'
import { AbstractModel } from '../../../api/abstract-model'
import { ViewModel } from '../../../api/abstract-view-model'

export interface PutRouteDefinition<T> {
  path?: string
  schema: Schemas<Constructor, Constructor<T>>
  outputSchema?: Constructor
  consumes: string
  produces?: string
}

export const Put = <
  Model extends AbstractModel,
  View extends ViewModel,
  State extends AbstractPutState<Model, View>
>(
  routeDefinition: PutRouteDefinition<View>
): TypedMethodDecorator<ReturnsConfiguredState<View, any, State>> => {
  return Route({
    ...routeDefinition,
    httpMethod: 'PUT',
  })
}
