export class Role {
  private _roleName: string
  private _toBeUsedForMissingAuthentication: boolean

  constructor(roleName: string, toBeUsedForMissingAuthentication = false) {
    this._roleName = roleName
    this._toBeUsedForMissingAuthentication = toBeUsedForMissingAuthentication
  }

  public get roleName(): string {
    return this._roleName
  }

  public set roleName(value: string) {
    this._roleName = value
  }

  public get toBeUsedForMissingAuthentication(): boolean {
    return this._toBeUsedForMissingAuthentication
  }

  public set toBeUsedForMissingAuthentication(value: boolean) {
    this._toBeUsedForMissingAuthentication = value
  }
}
