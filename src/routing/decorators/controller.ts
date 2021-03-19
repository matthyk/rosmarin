import constants from '../constants'
import { Lifecycle, scoped } from 'tsyringe'

export const Controller = (path = '/'): ClassDecorator => {
  return (target) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Reflect.decorate([scoped(Lifecycle.Singleton)], target)
    Reflect.defineMetadata(constants.CONTROLLER, path, target)
    return target
  }
}
