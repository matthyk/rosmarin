import {} from '../../types'
import { LoginState } from '../../api/states/login-state'
import { Route } from './route'
import { TypedMethodDecorator } from '../types'

export interface LoginRouteDefinition {
  path?: string
}

export const Login = (
  routeDefinition: LoginRouteDefinition = {}
): TypedMethodDecorator<LoginState> => {
  return Route({
    ...routeDefinition,
    httpMethod: 'GET',
    viewConverter: (_) => '',
    produces: 'text/plain',
    path: routeDefinition.path ?? '/login',
  })
}
