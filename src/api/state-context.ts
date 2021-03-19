export class StateContext {
  public static readonly ST_HTTP_HEADER = 'header'
  public static readonly ST_AUTH_USER = 'auth'

  private readonly store: Record<string, unknown>

  constructor()
  constructor(store: Record<string, unknown>)
  constructor(store?: Record<string, unknown>) {
    this.store = store ? store : {}
  }

  public put<T>(key: string, value: T): void {
    this.store[key] = value
  }

  public get<T>(key: string): T {
    return this.store[key] as T
  }
}
