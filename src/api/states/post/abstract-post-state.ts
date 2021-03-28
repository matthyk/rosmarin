import { AbstractModel } from '../../abstract-model'
import { ViewModel } from '../../abstract-view-model'
import { AbstractState } from '../abstract-state'
import { NoContentDatabaseResult } from '../../../database/results/no-content-database-result'
import { HttpResponse } from '../../../routing/http-response'

export abstract class AbstractPostState<
  T extends AbstractModel,
  V extends ViewModel
> extends AbstractState {
  protected _modelToCreate: V

  protected _modelToStoreInDatabase: T

  protected _modelForConstraintCheck: AbstractModel

  protected _dbResultAfterSave: NoContentDatabaseResult


  public get modelToCreate(): V {
    return this._modelToCreate;
  }

  public set modelToCreate(value: V) {
    this._modelToCreate = value;
  }

  public get modelToStoreInDatabase(): T {
    return this._modelToStoreInDatabase;
  }

  public set modelToStoreInDatabase(value: T) {
    this._modelToStoreInDatabase = value;
  }

  public get modelForConstraintCheck(): AbstractModel {
    return this._modelForConstraintCheck;
  }

  public set modelForConstraintCheck(value: AbstractModel) {
    this._modelForConstraintCheck = value;
  }

  public get dbResultAfterSave(): NoContentDatabaseResult {
    return this._dbResultAfterSave;
  }

  public set dbResultAfterSave(value: NoContentDatabaseResult) {
    this._dbResultAfterSave = value;
  }

  protected async buildInternal(): Promise<HttpResponse> {
    this.configureState()

    if ((await this.verifyApiKey()) === false) {
      return this.response.unauthorized( 'API key required.' )
    }

    if ((await this.verifyRolesOfClient()) === false) {
      return this.response.unauthorized( 'You have no power here!' )
    }

    this._modelForConstraintCheck = this._modelToCreate

    if ((await this.verifyAllStateEntryConstraints()) === false) {
      return this.response.forbidden( 'Forbidden' )
    }

    this.mergeViewModelToDatabaseModel()

    this._dbResultAfterSave = await this.createModelInDatabase()

    if (this._dbResultAfterSave.hasError()) {
      return this.response.internalServerError()
    }

    return await this.createResponse()
  }

  protected async createResponse(): Promise<HttpResponse> {
    this.defineLocationLink()

    await this.defineTransitionLinks()

    return this.response
  }

  protected defineLocationLink(): void {
    const locationLink: string =
      this._req.fullUrl + this._modelToStoreInDatabase.id
    this.response.location( locationLink )
    this.response.created()
  }

  protected abstract defineTransitionLinks(): Promise<void> | void

  private mergeViewModelToDatabaseModel(): void {
    this._modelToStoreInDatabase = this.createDatabaseModel()
    // TODO: ViewMerger.merge( this.modelToCreate, this.modelToStoreInDatabase )
    this._modelToStoreInDatabase.lastModifiedAt = Date.now()
  }

  protected abstract createDatabaseModel(): T

  protected abstract createModelInDatabase(): Promise<NoContentDatabaseResult>
}
