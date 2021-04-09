import {
  JsonSchema,
  JsonSchemaAndTransformer,
  Schemas,
  ViewConverter,
} from '../../route-definitions'
import {
  ReturnsConfiguredState,
  TypedMethodDecorator,
} from '../../../utility-types'
import { Route } from '../../decorators'
import { AbstractPutState } from '../../../api/states/put/abstract-put-state'
import { AbstractModel } from '../../../models/abstract-model'
import { AbstractViewModel } from '../../../models/abstract-view-model'

export interface PutRouteDefinition {
  path?: string
  schema: Schemas<JsonSchema, JsonSchemaAndTransformer>
  viewConverter?: ViewConverter
  consumes: string
  produces?: string
}

export const Put = <
  Model extends AbstractModel,
  View extends AbstractViewModel,
  State extends AbstractPutState<Model, View>
>(
  routeDefinition: PutRouteDefinition
): TypedMethodDecorator<ReturnsConfiguredState<View, any, State>> => {
  return Route({
    ...routeDefinition,
    httpMethod: 'PUT',
    viewConverter: routeDefinition.viewConverter,
  })
}
