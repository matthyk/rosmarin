import { AbstractModel } from './abstract-model'

export abstract class AbstractUserModel extends AbstractModel {
  principal: string
  password: string
  roles: string[]
}
