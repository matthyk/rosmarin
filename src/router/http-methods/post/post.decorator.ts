import {
  JsonSchema,
  JsonSchemaAndTransformer,
  Schemas,
} from '../../route-definitions'
import {
  ReturnsConfiguredState,
  TypedMethodDecorator,
} from '../../../utility-types'
import { Route } from '../../decorators'
import { AbstractPostState } from '../../../api/states/post/abstract-post-state'
import { AbstractModel } from '../../../models/abstract-model'
import { AbstractViewModel } from '../../../models/abstract-view-model'

export interface PostRouteDefinition {
  path?: string
  schema: Schemas<JsonSchema, JsonSchemaAndTransformer>
  consumes: string
}

export const Post = <
  Model extends AbstractModel,
  View extends AbstractViewModel,
  State extends AbstractPostState<Model, View>
>(
  routeDefinition: PostRouteDefinition
): TypedMethodDecorator<ReturnsConfiguredState<View, any, State>> => {
  return Route({
    ...routeDefinition,
    httpMethod: 'POST',
  })
}
