import { IError } from '../error-interface'

export class RoutingError extends Error implements IError {
  public constructor(
    public readonly status: number,
    public readonly error: string,
    public readonly message = error,
    public readonly code?: string | number
  ) {
    super(message)

    Object.setPrototypeOf(this, new.target.prototype)
  }

  public toJSON(): Record<string, string | number> {
    const error = {
      status: this.status,
      code: this.code,
      error: this.error,
      message: this.message,
    }

    if (typeof this.code === 'undefined') delete error.code

    return error
  }
}
