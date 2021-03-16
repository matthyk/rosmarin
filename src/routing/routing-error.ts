export class RoutingError extends Error {
  public constructor(
    public readonly statusCode: number,
    public readonly error: string,
    public readonly message = error,
    public readonly code?: string | number
  ) {
    super(message)

    Object.setPrototypeOf(this, new.target.prototype)
  }

  public toJSON(): Record<string, unknown> {
    const error = {
      statusCode: this.statusCode,
      code: this.code,
      error: this.error,
      message: this.message,
    }

    if (typeof this.code === 'undefined') delete error.code

    return error
  }
}
