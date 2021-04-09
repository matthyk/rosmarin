import { randomBytes } from 'crypto'

// https://github.com/dwyl/hapi-auth-jwt2#generating-your-secret-key
export const jwtSecret: string =
  process.env.JWT_SECRET || randomBytes(256).toString('base64')
