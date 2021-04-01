import { AbstractModel } from '../../../api/abstract-model'
import { Link, link } from '../../../api/link'
import {
  viewProp,
  viewArrayProp,
} from '../../../api/views/view-merger/decorators'
import { FruitModel } from './fruit-model'
import { LocationModel } from './location-model'

export class UserModel extends AbstractModel {
  @link('/users/{id}', 'self', 'application/vnd.user+json')
  self: Link

  @link('/users/{id}/friends', 'getFriend', 'application/vnd.friend+json')
  friends: Link

  name: string

  password: string

  @viewProp()
  location: LocationModel

  @viewArrayProp(FruitModel)
  fruits: FruitModel[]
}
