import { IAuthenticationInfoProvider } from './authentication-info-provider'
import { AuthenticationInfo } from './authentication-info'
import { AuthenticationHeader } from './authentication-header'
import { IUserRepository } from '../../database/repositories/user.repository'
import { singleton } from 'tsyringe'
import { sign, verify } from 'jsonwebtoken'
import { injectUserRepository, SingleModelDatabaseResult } from '../../database'
import { AbstractUserModel } from '../../models/abstract-user-model'
import { compare } from 'bcrypt'
import { AuthenticationInfoTokenToRespond } from './authentication-info-token-to-respond'
import { HttpError } from '../../router/errors/http-error'

const jwtSecret = '123abc'

@singleton()
export class JsonWebTokenAuthenticationInfoProvider
  implements IAuthenticationInfoProvider {
  constructor(
    @injectUserRepository()
    private readonly userRepository: IUserRepository
  ) {}

  public async get(
    authenticationHeader: AuthenticationHeader
  ): Promise<AuthenticationInfo> {
    if (
      authenticationHeader.isSet() &&
      authenticationHeader.isTokenAuthentication() === false &&
      authenticationHeader.principal &&
      authenticationHeader.credential
    ) {
      const principal = authenticationHeader.principal
      const credential = authenticationHeader.credential

      const databaseResult: SingleModelDatabaseResult<AbstractUserModel> = await this.userRepository.readUserByPrincipal(
        principal
      )

      if (databaseResult.isEmpty()) return AuthenticationInfo.NOT_AUTHENTICATED

      if (
        (await compare(credential, databaseResult.result.password)) === false
      ) {
        throw new HttpError(401, 'Unauthorized', 'Invalid password.')
      }

      const jwt = await sign(
        {
          userId: databaseResult.result.id,
          roles: databaseResult.result.roles,
        },
        jwtSecret
      )

      return AuthenticationInfo.withTokenToRespondAndPrincipal(
        new AuthenticationInfoTokenToRespond('authorization', jwt),
        principal,
        databaseResult.result.roles,
        databaseResult.result
      )
    } else if (
      authenticationHeader.isTokenAuthentication() &&
      authenticationHeader.isSet()
    ) {
      const jwtToken = authenticationHeader.token

      try {
        const decoded: AbstractUserModel = (await verify(
          jwtToken,
          jwtSecret
        )) as AbstractUserModel

        const databaseResult: SingleModelDatabaseResult<AbstractUserModel> = await this.userRepository.readUserById(
          decoded.id
        )

        return new AuthenticationInfo(
          databaseResult.result.principal,
          '',
          decoded.roles,
          databaseResult.result
        )
      } catch (e) {
        throw new HttpError(401, 'Unauthorized', 'Invalid token.')
      }
    } else {
      return AuthenticationInfo.NOT_AUTHENTICATED
    }
  }
}
