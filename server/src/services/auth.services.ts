import * as jwt from 'jsonwebtoken'
import { JWT_ACCESS_TOKEN_SECRET_KEY, JWT_REFRESH_TOKEN_SECRET_KEY } from '../secrets'
import bcrypt, { genSaltSync } from 'bcryptjs'
import { Types } from 'mongoose'
import HttpException from '../exceptions/root'
import { Role } from '../types/user.types'

export interface UserPayloadType {
  userId: Types.ObjectId
  role: Role
}

const generateToken = (payload: UserPayloadType, secretKey: string, expiresIn: string): string => {
  return jwt.sign(payload, secretKey, { expiresIn })
}

const verifyToken = (token: string, secretKey: string): UserPayloadType => {
  try {
    return jwt.verify(token, secretKey) as UserPayloadType
  } catch (error: any) {
    console.log('Token verification failed:', error.message)
    throw new HttpException('Invalid Token', 498)
  }
}

export const generateAccessToken = (payload: UserPayloadType) =>
  generateToken(payload, JWT_ACCESS_TOKEN_SECRET_KEY, '1d')

export const generateRefreshToken = (payload: UserPayloadType) =>
  generateToken(payload, JWT_REFRESH_TOKEN_SECRET_KEY, '30d')

export const generateTokens = (payload: UserPayloadType): { accessToken: string; refreshToken: string } => {
  const accessToken = generateToken(payload, JWT_ACCESS_TOKEN_SECRET_KEY, '1d')
  const refreshToken = generateToken(payload, JWT_REFRESH_TOKEN_SECRET_KEY, '30d')

  return { accessToken, refreshToken }
}

export const verifyAccessToken = (token: string) => verifyToken(token, JWT_ACCESS_TOKEN_SECRET_KEY)

export const verifyRefreshToken = (token: string) => verifyToken(token, JWT_REFRESH_TOKEN_SECRET_KEY)

export const encryptPassword = async (password: string): Promise<string> =>
  bcrypt.hashSync(password, genSaltSync(10))

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> =>
  bcrypt.compareSync(password, hashedPassword)
