import {
  JsonSchema,
  JsonSchemaAndTransformer,
  Schemas,
} from '../../route-definitions'
import { ReturnsConfiguredState, TypedMethodDecorator } from '../../types'
import { Route } from '../../decorators'
import { AbstractPostState } from '../../../api'
import { AbstractModel, AbstractViewModel } from '../../../models'

export interface PostRouteDefinition {
  path?: string
  schema: Schemas<JsonSchema, JsonSchemaAndTransformer>
  consumes: string
}

export const Post = <
  State extends AbstractPostState<AbstractModel, AbstractViewModel>
>(
  routeDefinition: PostRouteDefinition
): TypedMethodDecorator<ReturnsConfiguredState<State>> => {
  return Route({
    ...routeDefinition,
    httpMethod: 'POST',
  })
}
