import { closeServer, startServer } from '../../server'
import app from '../../app'
import request from 'supertest'
import { NextFunction } from 'express'
import UserModel from '../../models/User.model'
import { encryptPassword, generateToken } from '../../services/auth.services'
import { JWT_SECRET_KEY } from '../../secrets'

jest.mock('../../middleware/logger.middleware', () => ({
  logEvents: jest.fn(),
  logger: (_req: Request, _res: Response, next: NextFunction) => next(),
}))

beforeAll(async () => {
  await startServer()
})

afterAll(() => closeServer())

type Passwords = {
  password: string | null | undefined
  confirmPassword: string | null | undefined
}

type ResetPasswordFields = 'password' | 'confirmPassword'

type MultiTestTypes = {
  field: ResetPasswordFields
  value: any
  expectedMessage: string
}

const validPasswords: Passwords = {
  password: 'Password@1',
  confirmPassword: 'Password@1',
}

const validUser = {
  email: 'john@mail.com',
  password: 'Password@1',
  phone: '8976543659',
}

let token: string
let hashedPassword: string

const postPasswords = (passwords = validPasswords): Promise<any> => {
  return request(app)
    .put(`/api/v1/auth/reset-password?token=${token}`)
    .send(passwords)
    .expect('Content-Type', /json/)
}

describe('Reset Password --> POST /api/v1/auth/reset-password?token=some-token', () => {
  beforeAll(async () => {
    await UserModel.collection.deleteMany({})
    hashedPassword = await encryptPassword(validUser.password as string)
    const user = await UserModel.create({ ...validUser, password: hashedPassword })
    token = generateToken({ userId: user._id }, JWT_SECRET_KEY, '5m')
  })

  it('returns 400 when required input field is null', async () => {
    const response = await postPasswords({
      ...validPasswords,
      password: null,
      confirmPassword: 'Password',
    })

    expect(response.status).toBe(400)
  })

  it('returns validationErrors field in response body when validation Error occurs', async () => {
    const response = await postPasswords({
      ...validPasswords,
      password: null,
      confirmPassword: 'Password@1',
    })
    const {
      errors: { validationErrors },
    } = response.body

    expect(validationErrors).not.toBeUndefined()
    expect(Object.keys(validationErrors)).toEqual(['password'])
  })

  it.each`
    field                | value              | expectedMessage
    ${'password'}        | ${null}            | ${'Password cannot be null'}
    ${'password'}        | ${'Pass1'}         | ${'Password must be at least 6 characters'}
    ${'password'}        | ${'alllowercase'}  | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
    ${'password'}        | ${'ALLUPPERCASE'}  | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
    ${'password'}        | ${'1234567890'}    | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
    ${'password'}        | ${'lowerAndUPPER'} | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
    ${'password'}        | ${'lowerand123'}   | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
    ${'password'}        | ${'UPPERAND123'}   | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
    ${'confirmPassword'} | ${null}            | ${'Confirm Password cannot be null'}
    ${'confirmPassword'} | ${'Pass1'}         | ${'Confirm Password must be at least 6 characters'}
    ${'confirmPassword'} | ${'alllowercase'}  | ${'Confirm Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
    ${'confirmPassword'} | ${'ALLUPPERCASE'}  | ${'Confirm Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
    ${'confirmPassword'} | ${'1234567890'}    | ${'Confirm Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
    ${'confirmPassword'} | ${'lowerAndUPPER'} | ${'Confirm Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
    ${'confirmPassword'} | ${'lowerand123'}   | ${'Confirm Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
    ${'confirmPassword'} | ${'UPPERAND123'}   | ${'Confirm Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
  `(
    'return $expectedMessage when provided $field is $value',
    async ({ field, value, expectedMessage }: MultiTestTypes) => {
      const passwords: Passwords = {
        password: 'Password@1',
        confirmPassword: 'Password@1',
      }

      passwords[field] = value

      const {
        body: {
          errors: { validationErrors },
        },
      } = await postPasswords(passwords)

      expect(validationErrors[field]).toBe(expectedMessage)
    },
  )

  it('returns errors when both password and confirmPassword is null', async () => {
    const response = await postPasswords({
      ...validPasswords,
      password: null,
      confirmPassword: null,
    })

    const {
      errors: { validationErrors },
    } = response.body
    expect(Object.keys(validationErrors)).toEqual(expect.arrayContaining(['password', 'confirmPassword']))
  })

  it('returns error when provided token is invalid or expired', async () => {
    const token = 'invalid-token'
    const response = await request(app)
      .put(`/api/v1/auth/reset-password?token=${token}`)
      .send(validPasswords)
      .expect('Content-Type', /json/)

    expect(response.body.success).toBeFalsy()
    expect(response.body.message).toBe('Link expired! Request new link')
  })

  it('should confirm that the password is successfully changed in database', async () => {
    await postPasswords(validPasswords)

    const user = await UserModel.findOne({ email: validUser.email }).select(['password'])

    expect(user?.password).not.toEqual(hashedPassword)
  })

  it('returns success message when the password is successfully changed', async () => {
    const response = await postPasswords(validPasswords)

    expect(response.body.success).toBeTruthy()
    expect(response.body.message).toBe('Password updated successfully')
  })
})
