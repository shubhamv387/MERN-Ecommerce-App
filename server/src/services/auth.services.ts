import * as jwt from 'jsonwebtoken'
import { JWT_ACCESS_TOKEN_SECRET_KEY, JWT_REFRESH_TOKEN_SECRET_KEY } from '../secrets'

export interface UserPayloadType extends jwt.JwtPayload {
  userId: string
}

const generateToken = (payload: UserPayloadType, secretKey: string, expiresIn: string): string => {
  return jwt.sign(payload, secretKey, { expiresIn })
}

const verifyToken = (token: string, secretKey: string): UserPayloadType | null => {
  try {
    return jwt.verify(token, secretKey) as UserPayloadType
  } catch (error: any) {
    console.log('Token verification failed:', error.message)
    return null
  }
}

export const generateAccessToken = (payload: UserPayloadType) =>
  generateToken(payload, JWT_ACCESS_TOKEN_SECRET_KEY, '1d')

export const verifyAccessToken = (token: string) => verifyToken(token, JWT_ACCESS_TOKEN_SECRET_KEY)

export const generateRefreshToken = (payload: UserPayloadType) =>
  generateToken(payload, JWT_REFRESH_TOKEN_SECRET_KEY, '30d')

export const verifyRefreshToken = (token: string) => verifyToken(token, JWT_REFRESH_TOKEN_SECRET_KEY)
