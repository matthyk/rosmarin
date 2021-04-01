import { AbstractModel } from '../../../api/abstract-model'
import { Link, link } from '../../../api/link'

export class LocationModel extends AbstractModel {
  @link('/users/{id}/location', 'self', 'application/vnd.location+json')
  self: Link

  city: string

  street: string

  @link(
    '/locations/{id}/residents',
    'getResidents',
    'application/vnd.user+json'
  )
  residents: Link
}
