import { Route } from '../../decorators'
import { AbstractDeleteState } from '../../../api'
import { AbstractModel } from '../../../models'
import { ViewConverter } from '../../route-definitions'
import { ReturnsConfiguredState, TypedMethodDecorator } from '../../types'

/**
 * There should be no validation schema defined for DELETE requests, because the request payload should be ignored anyway.
 * See https://tools.ietf.org/html/rfc7231#section-4.3.5
 */
export interface DeleteRouteDefinition {
  path?: string
  viewConverter?: ViewConverter
  produces?: string
}

export const Delete = <State extends AbstractDeleteState<AbstractModel>>(
  routeDefinition: DeleteRouteDefinition = { path: '/:id' }
): TypedMethodDecorator<ReturnsConfiguredState<State>> => {
  return Route({
    path: '/:id',
    ...routeDefinition,
    httpMethod: 'DELETE',
  })
}
