/**
 * This class is used to send the JWT token to the user after a successful login during JWT authentication.
 */
export class AuthenticationInfoTokenToRespond {
  public tokenHeaderName: string

  public token: string

  constructor(tokenHeaderName: string, token: string) {
    this.tokenHeaderName = tokenHeaderName
    this.token = token
  }
}
