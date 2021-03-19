export class AuthenticationInfoTokenToRespond {
  private _tokenHeaderName: string

  private _token: string

  constructor(tokenHeaderName: string, token: string) {
    this._tokenHeaderName = tokenHeaderName
    this._token = token
  }

  public get tokenHeaderName(): string {
    return this._tokenHeaderName
  }

  public set tokenHeaderName(value: string) {
    this._tokenHeaderName = value
  }

  public get token(): string {
    return this._token
  }

  public set token(value: string) {
    this._token = value
  }
}
