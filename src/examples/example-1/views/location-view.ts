import { ViewModel } from '../../../api/abstract-view-model'
import { viewProp } from '../../../api/views/view-merger/decorators'

export class LocationView extends ViewModel {
  @viewProp({ minLength: 3 })
  city: string

  @viewProp()
  street: string
}
