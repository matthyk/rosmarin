import { ViewModel } from '../../../api/abstract-view-model'
import { viewProp } from '../../../api/views/view-merger/decorators'

export class UpdateUserView extends ViewModel {
  @viewProp()
  id: number

  @viewProp()
  name: string
}
