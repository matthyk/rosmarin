import { Route } from '../../decorators'
import { AbstractModel } from '../../../models'
import { AbstractGetCollectionState } from '../../../api'
import { ViewConverter } from '../../route-definitions'
import { ReturnsConfiguredState, TypedMethodDecorator } from '../../types'

/**
 * There should be no validation schema defined for GET requests, because the request payload should be ignored anyway.
 * See https://tools.ietf.org/html/rfc7231#section-4.3.1
 */
export interface GetRouteDefinition {
  path?: string
  viewConverter: ViewConverter
  produces: string
}

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
