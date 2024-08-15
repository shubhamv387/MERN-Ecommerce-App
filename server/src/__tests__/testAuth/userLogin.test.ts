import request from 'supertest'
import app from '../../app'
import UserModel from '../../models/User.model'
import { closeServer, startServer } from '../../server'
import { NextFunction, Request, Response } from 'express'
import { encryptPassword } from '../../services/auth.services'

jest.mock('../../middleware/loginLimiter', () => ({
  __esModule: true,
  default: (_req: Request, _res: Response, next: NextFunction) => next(),
}))

jest.mock('../../middleware/logger.middleware', () => ({
  logEvents: jest.fn(),
  logger: (_req: Request, _res: Response, next: NextFunction) => next(),
}))

beforeAll(async () => {
  await startServer()
})

afterAll(() => closeServer())

type User = {
  email: string | null | undefined
  password: string | null | undefined
  phone?: string | null | undefined
}

type LoginInputFields = 'email' | 'password' | 'phone'

type MultiTestTypes = {
  field: LoginInputFields
  value: any
  expectedMessage: string
}

const validUser: User = {
  email: 'john@mail.com',
  password: 'Password@1',
  phone: '8976543659',
}

const postUser = (user = validUser): Promise<any> => {
  return request(app).post('/api/v1/auth/login').send(user).expect('Content-Type', /json/)
}

describe('User login --> POST /api/v1/auth/login', () => {
  beforeAll(async () => {
    await UserModel.collection.deleteMany({})

    const hashedPassword = await encryptPassword(validUser.password as string)
    await UserModel.create({ ...validUser, password: hashedPassword })
  })

  it('returns 400 when required input field is null', async () => {
    const response = await postUser({
      ...validUser,
      password: 'Password',
      phone: null,
    })

    expect(response.status).toBe(400)
  })

  it('returns validationErrors field in response body when validation Error occurs', async () => {
    const response = await postUser({
      ...validUser,
      password: null,
    })
    const {
      errors: { validationErrors },
    } = response.body

    expect(validationErrors).not.toBeUndefined()
    expect(Object.keys(validationErrors)).toEqual(['password'])
  })

  it('returns errors when email and password is null and phone is not provided', async () => {
    const response = await postUser({
      ...validUser,
      password: null,
      email: null,
      phone: undefined,
    })

    const {
      errors: { validationErrors },
    } = response.body
    expect(Object.keys(validationErrors)).toEqual(expect.arrayContaining(['password', 'email']))
  })

  it('returns errors when phone and password is null and email is not provided', async () => {
    const response = await postUser({
      ...validUser,
      password: null,
      phone: null,
      email: undefined,
    })

    const {
      errors: { validationErrors },
    } = response.body
    expect(Object.keys(validationErrors)).toEqual(expect.arrayContaining(['password', 'phone']))
  })

  it('returns errors when email and phone both is not provided and password is null', async () => {
    const response = await postUser({
      ...validUser,
      password: null,
      phone: undefined,
      email: undefined,
    })

    const {
      errors: { validationErrors },
    } = response.body
    expect(Object.keys(validationErrors)).toEqual(expect.arrayContaining(['password', 'error']))
  })

  it.each`
    field         | value                | expectedMessage
    ${'email'}    | ${null}              | ${'E-mail cannot be null'}
    ${'email'}    | ${'mail.com'}        | ${'E-mail is not valid'}
    ${'email'}    | ${'user.mail.com'}   | ${'E-mail is not valid'}
    ${'email'}    | ${'user@mail'}       | ${'E-mail is not valid'}
    ${'email'}    | ${'1234'}            | ${'E-mail is not valid'}
    ${'password'} | ${null}              | ${'Password cannot be null'}
    ${'password'} | ${'Pass1'}           | ${'Password must be at least 6 characters'}
    ${'password'} | ${'alllowercase'}    | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
    ${'password'} | ${'ALLUPPERCASE'}    | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
    ${'password'} | ${'1234567890'}      | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
    ${'password'} | ${'lowerAndUPPER'}   | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
    ${'password'} | ${'lowerand123'}     | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
    ${'password'} | ${'UPPERAND123'}     | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
    ${'phone'}    | ${null}              | ${'Phone cannot be null'}
    ${'phone'}    | ${'1234'}            | ${'Must be 10 digits long'}
    ${'phone'}    | ${'123456789012345'} | ${'Must be 10 digits long'}
    ${'phone'}    | ${'abcASD@123'}      | ${'Must contain only numeric characters'}
    ${'phone'}    | ${'2345764768'}      | ${'Must start with a digit between 6 and 9'}
  `(
    'return $expectedMessage when provided $field is $value',
    async ({ field, value, expectedMessage }: MultiTestTypes) => {
      const user: User = {
        email: 'john@mail.com',
        password: 'Password@1',
      }

      user[field] = value

      const {
        body: {
          errors: { validationErrors },
        },
      } = await postUser(user)

      expect(validationErrors[field]).toBe(expectedMessage)
    },
  )

  it('returns Error when email does not exists', async () => {
    const user = { ...validUser, email: 'newemail@mail.com' }

    const response = await postUser({ ...user, phone: undefined })
    const { success, message } = response.body

    expect(success).toBeFalsy()
    expect(message).toBe('Invalid credentials')
  })
  it('returns Error when phone number does not exists', async () => {
    const user = { ...validUser, phone: '9876543478' }

    const response = await postUser({ ...user, email: undefined })
    const { success, message } = response.body

    expect(success).toBeFalsy()
    expect(message).toBe('Invalid credentials')
  })

  /* ------------------------------------------------------------------------ */

  it('returns 200 when user logged in successfully', async () => {
    const response = await postUser()
    expect(response.status).toBe(200)
  })

  it('returns something in response body when user logged in successfully', async () => {
    const response = await postUser()

    expect(Object.keys(response.body)).toHaveLength(3)
    expect(Object.keys(response.body)).toEqual(expect.arrayContaining(['success', 'message', 'token']))
  })

  it('returns success true when user logged in successfully', async () => {
    const response = await postUser()
    expect(response.body.success).toBeTruthy()
  })

  /* ----------------------------------------------------------------------- */
})
