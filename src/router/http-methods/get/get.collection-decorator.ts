import { Route } from '../../decorators'
import { AbstractModel } from '../../../models'
import { AbstractGetCollectionState } from '../../../api'
import { ReturnsConfiguredState, TypedMethodDecorator } from '../../types'
import { GetRouteDefinition } from './get.decorator'

export const GetCollection = <
  State extends AbstractGetCollectionState<AbstractModel>
>(
  routeDefinition: GetRouteDefinition
): TypedMethodDecorator<ReturnsConfiguredState<State>> => {
  return Route({
    ...routeDefinition,
    httpMethod: 'GET',
  })
}
