import { AbstractResult } from '../../abstract-result'

export abstract class AbstractDatabaseResult extends AbstractResult {
  protected databaseExecutionTimeInMs: number

  public setTimes(startTime: number, stopTime: number): void {
    this.databaseExecutionTimeInMs = stopTime - startTime
  }

  public getDuration(): number {
    return this.databaseExecutionTimeInMs
  }
}
