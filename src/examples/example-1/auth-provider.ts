import { singleton } from 'tsyringe'
import { AuthenticationInfoProvider } from '../../api/security/authentication-info-provider'
import { AuthenticationHeader } from '../../api/security/authentication-header'
import { AuthenticationInfo } from '../../api/security/authentication-info'
import { sign, verify, VerifyErrors } from 'jsonwebtoken'
import { SingleModelDatabaseResult } from '../../database/results/single-model-database-result'
import { UserRepository } from './repositories/user-repository'
import { UserModel } from './models/user-model'
import { AuthenticationInfoTokenToRespond } from '../../api/security/authentication-info-token-to-respond'

const jwtSecret = 's3cr3t'

@singleton()
export class MyAuthProvider implements AuthenticationInfoProvider {
  constructor(protected readonly userRepository: UserRepository) {}

  public async get(
    authenticationHeader: AuthenticationHeader
  ): Promise<AuthenticationInfo> {
    if (
      authenticationHeader.isSet() &&
      authenticationHeader.isTokenAuthentication()
    ) {
      const jwtToken: string = authenticationHeader.token

      return new Promise<AuthenticationInfo>((resolve) => {
        verify(
          jwtToken,
          jwtSecret,
          async (err: VerifyErrors | null, decoded: unknown | undefined) => {
            if (err) resolve(new AuthenticationInfo(false))

            const userId: string = (decoded as any)['userId']
            const roles: string[] = (decoded as any)['roles']

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const result: SingleModelDatabaseResult<UserModel> = await this.userRepository.readById(
              userId
            )

            resolve(new AuthenticationInfo('a', 'c', roles, result.result))
          }
        )
      })
    } else if (
      authenticationHeader.isSet() &&
      authenticationHeader.principal &&
      authenticationHeader.credential
    ) {
      const result: SingleModelDatabaseResult<UserModel> = await this.userRepository.readById(
        authenticationHeader.principal
      )

      if (result.isEmpty()) return new AuthenticationInfo(false)

      if (result.result.password === authenticationHeader.credential) {
        return new AuthenticationInfo(
          new AuthenticationInfoTokenToRespond(
            'Authorization',
            await sign(
              { userId: result.result.id, roles: ['admin'] },
              jwtSecret
            )
          )
        )
      }
    }

    return new AuthenticationInfo(false)
  }
}
