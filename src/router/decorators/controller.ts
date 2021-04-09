import { singleton } from 'tsyringe'
import { routerMetadataStore } from '../../metadata-stores'

export const Controller = (path = '/'): ClassDecorator => {
  return (target: any) => {
    Reflect.decorate([singleton() as ClassDecorator], target)
    routerMetadataStore.registerController(target, { prefix: path })
    return target
  }
}
