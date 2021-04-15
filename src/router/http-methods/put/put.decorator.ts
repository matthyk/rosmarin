import {
  JsonSchema,
  JsonSchemaAndTransformer,
  Schemas,
  ViewConverter,
} from '../../route-definitions'
import { ReturnsConfiguredState, TypedMethodDecorator } from '../../types'
import { Route } from '../../decorators'
import { AbstractPutState } from '../../../api'
import { AbstractModel } from '../../../models'
import { AbstractViewModel } from '../../../models'

export interface PutRouteDefinition {
  path?: string
  schema: Schemas<JsonSchema, JsonSchemaAndTransformer>
  viewConverter?: ViewConverter
  consumes: string
  produces?: string
}

export const Put = <
  State extends AbstractPutState<AbstractModel, AbstractViewModel>
>(
  routeDefinition: PutRouteDefinition
): TypedMethodDecorator<ReturnsConfiguredState<State>> => {
  return Route({
    path: '/:id',
    ...routeDefinition,
    httpMethod: 'PUT',
  })
}
