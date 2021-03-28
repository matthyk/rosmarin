import { randomBytes } from 'crypto'

let key: string | undefined = undefined

export const getKey = (): string => {
  if (typeof key === 'undefined') {
    // https://github.com/dwyl/hapi-auth-jwt2#generating-your-secret-key
    key = randomBytes(256).toString('base64')
  }

  return key
}
