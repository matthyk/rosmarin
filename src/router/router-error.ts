import { IError } from '../error-interface'

/**
 * HTTP error thrown during runtime within the router.
 *
 * DO NOT use it in your application.
 */
export class RouterError extends Error implements IError {
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
    if (typeof this.code === 'undefined') {
      return {
        status: this.status,
        error: this.error,
        message: this.message,
      }
    } else {
      return {
        status: this.status,
        code: this.code,
        error: this.error,
        message: this.message,
      }
    }
  }
}
