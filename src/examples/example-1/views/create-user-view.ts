import { ViewModel } from '../../../api/abstract-view-model'
import { LocationView } from './location-view'
import { viewProp } from '../../../api/views/view-merger/decorators'
import { viewArrayProp } from '../../../api/views/view-merger/decorators'
import { FruitView } from './fruit-view'

export class CreateUserView extends ViewModel {
  @viewProp()
  name: string

  @viewProp()
  password: string

  @viewProp()
  location: LocationView

  @viewArrayProp(FruitView)
  fruits: FruitView[]
}
