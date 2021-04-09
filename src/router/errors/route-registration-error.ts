export class RouteRegistrationError extends Error {
  public constructor(message: string, public readonly details?: string) {
    super(message)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
