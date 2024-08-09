import {
  generateAccessToken,
  generateRefreshToken,
  UserPayloadType,
  verifyAccessToken,
  verifyRefreshToken,
} from '../../services/auth.services'

const validPayload: UserPayloadType = {
  userId: '66b5f92656548ce5cf5bad56',
}

const invalidToken: string = 'providingAnInvalidToken'

describe('Auth Services -->', () => {
  it('should generate access token', () => {
    const token = generateAccessToken(validPayload)

    expect(typeof token).toBe('string')
  })

  it('should return the payload object when access token is valid', () => {
    const validToken = generateAccessToken(validPayload)
    const result: UserPayloadType | null = verifyAccessToken(validToken)

    expect(typeof result).toBe('object')
    expect(result).toHaveProperty('userId')
    expect(result!.userId).toEqual(validPayload.userId)
  })

  it('should return null when access token is invalid', () => {
    const result: UserPayloadType | null = verifyAccessToken(invalidToken)

    expect(result).toBeNull()
  })

  it('should generate refresh token', () => {
    const token = generateRefreshToken(validPayload)

    expect(typeof token).toBe('string')
  })

  it('should return the payload object when refresh token is valid', () => {
    const validToken = generateRefreshToken(validPayload)
    const result: UserPayloadType | null = verifyRefreshToken(validToken)

    expect(typeof result).toBe('object')
    expect(result).toHaveProperty('userId')
    expect(result!.userId).toEqual(validPayload.userId)
  })

  it('should return null when refresh token is invalid', () => {
    const result: UserPayloadType | null = verifyRefreshToken(invalidToken)

    expect(result).toBeNull()
  })
})
