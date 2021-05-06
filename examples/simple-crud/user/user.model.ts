import { AbstractModel, Link, link, modelProp } from '../../../src'

export class User extends AbstractModel<number> {
  @modelProp()
  name: string

  @modelProp()
  password: string

  @modelProp()
  age: number

  @link('/users/{id}', 'self', 'application/vnd.user+json')
  self: Link
}
