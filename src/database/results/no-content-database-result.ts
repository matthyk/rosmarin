import { AbstractDatabaseResult } from './abstract-database-result'

export class NoContentDatabaseResult extends AbstractDatabaseResult {

  constructor() {
    super();
  }

  public isEmpty(): boolean {
    return true
  }
}
