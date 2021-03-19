import { Role } from './role'

export enum Logical {
  AND,
  OR,
}

export class Roles {
  private readonly roles: Role[]

  private readonly logical: Logical

  public static createLogicalOrRoles(...roles: string[]): Roles {
    const theRoles: Role[] = roles.map((role: string) => new Role(role))

    return new Roles(Logical.OR, ...theRoles)
  }

  constructor()
  constructor(role: Role)
  constructor(logical: Logical, ...roles: Role[])
  constructor(roleOrLogical?: Role | Logical, ...roles: Role[]) {
    if (!roleOrLogical && (!roles || roles?.length === 0)) {
      this.roles = []
      this.logical = Logical.AND
    } else if (roleOrLogical instanceof Role) {
      this.roles = [roleOrLogical]
      this.logical = Logical.AND
    } else {
      this.roles = roles
      this.logical = roleOrLogical
    }
  }

  public matches(roleNames: string[]): boolean {
    const roleAsSet = new Set<string>(roleNames)

    if (this.logical === Logical.AND) {
      return this.matchLogicalAnd(roleAsSet)
    } else {
      return this.matchLogicalOr(roleAsSet)
    }
  }

  private matchLogicalOr(roleAsSet: Set<string>): boolean {
    return this.roles.some((role: Role) => roleAsSet.has(role.roleName))
  }

  private matchLogicalAnd(roleAsSet: Set<string>): boolean {
    return this.roles.every((role: Role) => roleAsSet.has(role.roleName))
  }

  public matchesWithoutAuthentication(): boolean {
    return this.roles.some(
      (role: Role) => role.toBeUsedForMissingAuthentication
    )
  }
}
