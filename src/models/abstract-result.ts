export abstract class AbstractResult {
  private _hasError: boolean

  public errorCode: number

  public errorMessage: string

  public abstract isEmpty(): boolean

  protected constructor() {
    this._hasError = false
  }

  public hasError(): boolean {
    return this._hasError
  }

  public setError(): void
  public setError(errorCode: number, errorMessage: string): void
  public setError(errorCode?: number, errorMessage?: string): void {
    this._hasError = true
    this.errorCode = errorCode
    this.errorMessage = errorMessage
  }
}
