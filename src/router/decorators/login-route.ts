import {
  ReturnsConfiguredState,
  TypedMethodDecorator,
} from '../../utility-types'
import { LoginState } from '../../api/states/login-state'
import { Route } from './route'

export interface LoginRouteDefinition {
  path?: string
}

export const Login = (
  routeDefinition: LoginRouteDefinition = {}
): TypedMethodDecorator<ReturnsConfiguredState<never, any, LoginState>> => {
  return Route({
    ...routeDefinition,
    httpMethod: 'GET',
    viewConverter: (_) => '',
    produces: 'text/plain',
    path: routeDefinition.path ?? '/login',
  })
}
