import {
  AbstractViewModel,
  buildViewConverter,
  collectionView,
  viewProp,
} from '../../../../src'
import { User } from '../user.model'

@collectionView()
export class CollectionUserView extends AbstractViewModel {
  @viewProp()
  name: string
}

export const collectionUserViewConverter = buildViewConverter(
  User,
  CollectionUserView
)
