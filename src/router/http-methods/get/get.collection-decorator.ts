import {
  Constructor,
  ReturnsConfiguredState,
  TypedMethodDecorator,
} from '../../utility-types'
import { Route } from '../../decorators/route'
import { AbstractModel } from '../../../api/abstract-model'
import { AbstractGetCollectionState } from '../../../api/states/get/abstract-get-collection-state'

/**
 * There should be no validation schema defined for GET requests, because the request payload should be ignored anyway.
 * See https://tools.ietf.org/html/rfc7231#section-4.3.1
 */
export interface GetRouteDefinition {
  path?: string
  outputSchema?: Constructor
  produces: string
}

export const GetCollection = <
  Model extends AbstractModel,
  State extends AbstractGetCollectionState<Model>
>(
  routeDefinition: GetRouteDefinition
): TypedMethodDecorator<ReturnsConfiguredState<never, any, State>> => {
  return Route({
    ...routeDefinition,
    httpMethod: 'GET',
  })
}