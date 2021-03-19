import { AbstractGetState } from '../states/get/abstract-get-state'
import { AbstractModel } from '../abstract-model'

export function checkIfRequestedIdIsUserId(
  this: AbstractGetState<AbstractModel>
): boolean {
  return this.requestedId == this.authInfo.userModel.id
}
