import constants from '../constants'

export const Controller = (path = '/'): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(constants.CONTROLLER, path, target)
    return target
  }
}
