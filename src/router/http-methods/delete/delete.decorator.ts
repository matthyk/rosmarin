import {
  Constructor,
  ReturnsConfiguredState,
  TypedMethodDecorator,
} from '../../utility-types'
import { Route } from '../../decorators/route'
import { AbstractDeleteState } from '../../../api/states/delete/abstract-delete-state'
import { AbstractModel } from '../../../api/abstract-model'

/**
 * There should be no validation schema defined for DELETE requests, because the request payload should be ignored anyway.
 * See https://tools.ietf.org/html/rfc7231#section-4.3.5
 */
export interface DeleteRouteDefinition {
  path?: string
  outputSchema?: Constructor
  produces?: string
}

export const Delete = <
  Model extends AbstractModel,
  State extends AbstractDeleteState<Model>
>(
  routeDefinition: DeleteRouteDefinition = {}
): TypedMethodDecorator<ReturnsConfiguredState<never, any, State>> => {
  return Route({
    ...routeDefinition,
    httpMethod: 'DELETE',
  })
}
