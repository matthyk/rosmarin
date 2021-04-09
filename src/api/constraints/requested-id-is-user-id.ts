import { AbstractGetState } from '../states'
import { AbstractModel } from '../../models'

export function checkIfRequestedIdIsUserId(
  this: AbstractGetState<AbstractModel>
): boolean {
  return this.requestedId == this.authenticationInfo.userModel.id
}
