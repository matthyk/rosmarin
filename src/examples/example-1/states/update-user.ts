import { AbstractPutState } from '../../../api/states/put/abstract-put-state'
import { UserModel } from '../models/user-model'
import { UpdateUserView } from '../views/update-user-view'
import { SingleModelDatabaseResult } from '../../../database/results/single-model-database-result'
import { NoContentDatabaseResult } from '../../../database/results/no-content-database-result'
import { UserRepository } from '../repositories/user-repository'
import { State } from '../../../api/states/decorator'

@State()
export class UpdateUser extends AbstractPutState<UserModel, UpdateUserView> {
  constructor(private readonly userRepository: UserRepository) {
    super()
  }

  protected defineTransitionLinks(): Promise<void> | void {
    return undefined
  }

  protected loadModelFromDatabase(): Promise<
    SingleModelDatabaseResult<UserModel>
  > {
    return this.userRepository.readById(this.modelToUpdate.id)
  }

  protected updateModelInDatabase(): Promise<NoContentDatabaseResult> {
    return this.userRepository.update(this.modelInDatabase)
  }

  protected configureState(): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.addStateEntryConstraint(
      () => this.modelToUpdate.id == this.req.params.id
    )
  }
}
