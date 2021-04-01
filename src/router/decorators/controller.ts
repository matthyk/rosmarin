import { singleton } from 'tsyringe'
import constants from '../../constants'

export const Controller = (path = '/'): ClassDecorator => {
  return (target: any) => {
    Reflect.decorate([singleton() as ClassDecorator], target)
    Reflect.defineMetadata(constants.CONTROLLER, path, target)
    return target
  }
}
