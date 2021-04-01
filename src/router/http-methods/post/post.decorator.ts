import { Schemas } from '../../route-definitions'
import {
  Constructor,
  ReturnsConfiguredState,
  TypedMethodDecorator,
} from '../../utility-types'
import { Route } from '../../decorators/route'
import { AbstractPostState } from '../../../api/states/post/abstract-post-state'
import { AbstractModel } from '../../../api/abstract-model'
import { ViewModel } from '../../../api/abstract-view-model'

export interface PostRouteDefinition<T extends ViewModel> {
  path?: string
  schema: Schemas<Constructor, Constructor<T>>
  consumes: string
}

export const Post = <
  Model extends AbstractModel,
  View extends ViewModel,
  State extends AbstractPostState<Model, View>
>(
  routeDefinition: PostRouteDefinition<View>
): TypedMethodDecorator<ReturnsConfiguredState<View, any, State>> => {
  return Route({
    ...routeDefinition,
    httpMethod: 'POST',
  })
}
