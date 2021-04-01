/**
 * Error that should be thrown only in the persistence layer
 */
export class DatabaseError extends Error {
  public constructor(message?: string) {
    super(message)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
