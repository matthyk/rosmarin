export class QueryStatement {

  protected _urlQueryParameters: Record<string, unknown> = {}

  protected _query: string

  protected _orderBy: string

  constructor()
  constructor(query: string)
  constructor(query: string = '') {
    this._query = query;
  }

  public addQueryParameter(key: string, value: unknown): void {
    this._urlQueryParameters[key] = value
  }

  public get urlQueryParameters(): Record<string, unknown> {
    return this._urlQueryParameters;
  }

  public set urlQueryParameters(value: Record<string, unknown>) {
    this._urlQueryParameters = value;
  }

  public get query(): string {
    return this._query;
  }

  public set query(value: string) {
    this._query = value;
  }

  public get orderBy(): string {
    return this._orderBy;
  }

  public set orderBy(value: string) {
    this._orderBy = value;
  }
}
