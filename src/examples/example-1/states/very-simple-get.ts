import { AbstractGetState } from '../../../api/states/get/abstract-get-state'
import { UserModel } from '../models/user-model'
import { SingleModelDatabaseResult } from '../../../database/results/single-model-database-result'
import { State } from '../../../api/states/decorator'

@State()
export class VerySimpleGet extends AbstractGetState<UserModel> {
  constructor() {
    super()
    this.logger.fatal('VerySimpleGet CTOR')
  }

  protected defineTransitionLinks(): Promise<void> | void {}

  protected async loadModelFromDatabase(): Promise<
    SingleModelDatabaseResult<UserModel>
  > {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return new SingleModelDatabaseResult({})
  }
}
