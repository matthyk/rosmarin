export class Role {
  public roleName: string
  public toBeUsedForMissingAuthentication: boolean

  constructor(roleName: string, toBeUsedForMissingAuthentication = false) {
    this.roleName = roleName
    this.toBeUsedForMissingAuthentication = toBeUsedForMissingAuthentication
  }
}
