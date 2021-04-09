import { IError } from '../../models/error-model'

export class HttpError extends Error implements IError {
  public constructor(
    public readonly status: number,
    public readonly error: string,
    public readonly message = error,
    public readonly code?: string | number
  ) {
    super(message)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
