import {
  ReturnsConfiguredState,
  TypedMethodDecorator,
} from '../../../utility-types'
import { Route } from '../../decorators'
import { AbstractGetState } from '../../../api'
import { AbstractModel } from '../../../models'
import { ViewConverter } from '../../route-definitions'

/**
 * There should be no validation schema defined for GET requests, because the request payload should be ignored anyway.
 * See https://tools.ietf.org/html/rfc7231#section-4.3.1
 */
export interface GetRouteDefinition {
  path?: string
  viewConverter: ViewConverter
  produces: string
}

export const Get = <
  Model extends AbstractModel,
  State extends AbstractGetState<Model>
>(
  routeDefinition: GetRouteDefinition
): TypedMethodDecorator<ReturnsConfiguredState<never, any, State>> => {
  return Route({
    ...routeDefinition,
    httpMethod: 'GET',
  })
}
