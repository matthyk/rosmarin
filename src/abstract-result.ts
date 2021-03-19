export abstract class AbstractResult {
  protected _hasError: boolean

  private _errorCode: number

  private _errorMessage: string

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
    this._errorCode = errorCode
    this._errorMessage = errorMessage
  }

  public get errorCode(): number {
    return this._errorCode
  }

  public get errorMessage(): string {
    return this._errorMessage
  }
}
