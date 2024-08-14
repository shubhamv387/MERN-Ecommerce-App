import { Types } from 'mongoose'
import {
  comparePassword,
  encryptPassword,
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  UserPayloadType,
  verifyAccessToken,
  verifyRefreshToken,
} from '../../services/auth.services'
import HttpException from '../../exceptions/root'
import { Role } from '../../types/user.types'

const validPayload: UserPayloadType = {
  userId: new Types.ObjectId(),
  role: Role.Customer,
}

const invalidToken: string = 'providingAnInvalidToken'

describe('Auth Services -->', () => {
  describe('Token generation and verification -->', () => {
    it('generateAccessToken --> should generate access token', () => {
      const token = generateAccessToken(validPayload)

      expect(typeof token).toBe('string')
    })

    it('generateRefreshToken --> should generate refresh token', () => {
      const token = generateRefreshToken(validPayload)

      expect(typeof token).toBe('string')
    })

    it('generateTokens --> should generate access and refresh tokens', () => {
      const token = generateTokens(validPayload)
      expect(Object.keys(token)).toHaveLength(2)
      expect(Object.keys(token)).toEqual(expect.arrayContaining(['accessToken', 'refreshToken']))
      expect(typeof token.accessToken).toBe('string')
      expect(typeof token.refreshToken).toBe('string')
    })

    it('verifyAccessToken --> should return the payload object when access token is valid', () => {
      const validToken = generateAccessToken(validPayload)
      const result = verifyAccessToken(validToken) as { userId: string }

      expect(typeof result).toBe('object')
      expect(Object.keys(result)).toHaveLength(4)
      expect(Object.keys(result)).toStrictEqual(expect.arrayContaining(['userId', 'role', 'iat', 'exp']))
      expect(result!.userId).toEqual(validPayload.userId.toString())
    })

    it('verifyRefreshToken --> should return the payload object when refresh token is valid', () => {
      const validToken = generateRefreshToken(validPayload)
      const result = verifyRefreshToken(validToken) as { userId: string }

      expect(typeof result).toBe('object')
      expect(Object.keys(result)).toHaveLength(4)
      expect(Object.keys(result)).toStrictEqual(expect.arrayContaining(['userId', 'role', 'iat', 'exp']))
      expect(result!.userId).toEqual(validPayload.userId.toString())
    })

    it('verifyAccessToken --> should throw an HttpException when access token is invalid', () => {
      try {
        verifyAccessToken(invalidToken)
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException)
        expect(error.message).toBe('Invalid Token')
        expect(error.statusCode).toBe(498)
      }
    })

    it('verifyRefreshToken --> should throw an HttpException when refresh token is invalid', () => {
      try {
        verifyRefreshToken(invalidToken)
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException)
        expect(error.message).toBe('Invalid Token')
        expect(error.statusCode).toBe(498)
      }
    })
  })

  describe('Password encryption and verification -->', () => {
    it('encryptPassword --> should return the encrypted password', async () => {
      const password = 'Password1'
      const hashedPassword = await encryptPassword(password)

      expect(hashedPassword).not.toEqual(password)
    })

    it('comparePassword --> should return true if the provided password is valid', async () => {
      const password = 'Password1'
      const hashedPassword = await encryptPassword(password)

      const isMatchedPassword = await comparePassword(password, hashedPassword)

      expect(typeof isMatchedPassword).toBe('boolean')
      expect(isMatchedPassword).toBeTruthy()
    })

    it('comparePassword --> should return false if the provided password is invalid', async () => {
      const password = 'Password1'
      const invalidPassword = 'invalidPassword'
      const hashedPassword = await encryptPassword(password)

      const isMatchedPassword = await comparePassword(invalidPassword, hashedPassword)

      expect(typeof isMatchedPassword).toBe('boolean')
      expect(isMatchedPassword).toBeFalsy()
    })
  })
})
