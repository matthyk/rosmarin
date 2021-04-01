import { ViewModel } from '../../../api/abstract-view-model'
import { viewProp } from '../../../api/views/view-merger/decorators'

export class FruitView extends ViewModel {
  @viewProp()
  name: string
}
