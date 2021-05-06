import { singleton } from 'tsyringe'
import {
  CollectionModelDatabaseResult,
  ModelId,
  NoContentDatabaseResult,
  SingleModelDatabaseResult,
} from '../../../src'
import { User } from './user.model'

interface UserInDB {
  id: number

  lastModifiedAt: number

  name: string

  password: string

  age: number
}

const userToUserInDB = (user: User): UserInDB => {
  return {
    id: user.id,
    lastModifiedAt: user.lastModifiedAt,
    name: user.name,
    password: user.password,
    age: user.age,
  }
}

const usersInDbToUsers = (userInDB: UserInDB[]): User[] => {
  return userInDB.map(userInDbToUser)
}

const userInDbToUser = (userInDB: UserInDB): User => {
  const user = new User()

  user.id = userInDB.id
  user.age = userInDB.age
  user.name = userInDB.name
  user.lastModifiedAt = userInDB.lastModifiedAt
  user.password = userInDB.password

  return user
}

@singleton()
export class UserRepository {
  private readonly users: UserInDB[] = []
  private _id = 1

  public get id(): number {
    return this._id++
  }

  public async create(user: User): Promise<NoContentDatabaseResult> {
    user.id = this.id

    this.users.push(userToUserInDB(user))

    return new NoContentDatabaseResult()
  }

  public async readById(id: ModelId): Promise<SingleModelDatabaseResult<User>> {
    const userInDB = this.users.find((u) => u.id == id)

    if (typeof userInDB === 'undefined') {
      return new SingleModelDatabaseResult<User>()
    } else {
      return new SingleModelDatabaseResult<User>(userInDbToUser(userInDB))
    }
  }

  public async readAll(
    offset: number,
    size: number
  ): Promise<CollectionModelDatabaseResult<User>> {
    const result = new CollectionModelDatabaseResult<User>(
      usersInDbToUsers(this.users.slice(offset, offset + size))
    )

    result.totalNumberOfResult = this.users.length

    return result
  }

  public async deleteById(id: ModelId): Promise<NoContentDatabaseResult> {
    const idx = this.users.findIndex((u) => u.id == id)

    this.users.splice(idx, 1)

    return new NoContentDatabaseResult()
  }

  public async update(user: User): Promise<NoContentDatabaseResult> {
    const idx = this.users.findIndex((u) => u.id == user.id)

    this.users[idx] = userToUserInDB(user)

    return new NoContentDatabaseResult()
  }
}
