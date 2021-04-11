import { AbstractModel } from './abstract-model'
import { modelArrayProp, modelProp } from '../api'

export abstract class AbstractUserModel extends AbstractModel {
  @modelProp()
  principal: string

  @modelProp()
  password: string

  @modelArrayProp(() => String)
  roles: string[]
}
