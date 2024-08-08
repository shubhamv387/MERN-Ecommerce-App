import request from 'supertest'
import app from '../../app'
import UserModel from '../../models/User.model'
import { closeServer, startServer } from '../../server'
import { NextFunction, Request, Response } from 'express'

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
  firstName?: string | null | undefined
  lastName?: string | null | undefined
}

type RegisterInputFields = 'email' | 'password' | 'phone' | 'firstName' | 'lastName'
type MultiTestTypes = {
  field: RegisterInputFields
  value: any
  expectedMessage: string
}

const validUser: User = {
  email: 'john@mail.com',
  password: 'Password@1',
}

const postUser = (user = validUser): Promise<any> => {
  return request(app).post('/api/v1/auth/register').send(user).expect('Content-Type', /json/)
}

describe('User registration --> POST /api/v1/auth/register', () => {
  beforeEach(() => UserModel.collection.deleteMany({}))

  it('returns 400 when required input field is null', async () => {
    const response = await postUser({
      ...validUser,
      email: null,
    })

    expect(response.status).toBe(400)
  })

  it('returns validationErrors field in response body when validation Error occurs', async () => {
    const response = await postUser({
      ...validUser,
      email: null,
    })
    const {
      errors: { validationErrors },
    } = response.body

    expect(validationErrors).not.toBeUndefined()
    expect(Object.keys(validationErrors)).toEqual(['email'])
  })

  it('returns errors for both when email and password is null', async () => {
    const response = await postUser({
      ...validUser,
      password: null,
      email: null,
    })

    const {
      errors: { validationErrors },
    } = response.body
    expect(Object.keys(validationErrors)).toEqual(expect.arrayContaining(['password', 'email']))
  })

  it.each`
    field          | value                | expectedMessage
    ${'email'}     | ${null}              | ${'E-mail cannot be null'}
    ${'email'}     | ${'mail.com'}        | ${'E-mail is not valid'}
    ${'email'}     | ${'user.mail.com'}   | ${'E-mail is not valid'}
    ${'email'}     | ${'user@mail'}       | ${'E-mail is not valid'}
    ${'email'}     | ${'1234'}            | ${'E-mail is not valid'}
    ${'password'}  | ${null}              | ${'Password cannot be null'}
    ${'password'}  | ${'Pass1'}           | ${'Password must be at least 6 characters'}
    ${'password'}  | ${'alllowercase'}    | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
    ${'password'}  | ${'ALLUPPERCASE'}    | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
    ${'password'}  | ${'1234567890'}      | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
    ${'password'}  | ${'lowerAndUPPER'}   | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
    ${'password'}  | ${'lowerand123'}     | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
    ${'password'}  | ${'UPPERAND123'}     | ${'Password must have at least 1 uppercase, 1 lowercase, and 1 number character'}
    ${'firstName'} | ${'f'}               | ${'Must have at least 2 characters'}
    ${'firstName'} | ${'f'.repeat(33)}    | ${'Must have a maximum of 32 characters'}
    ${'firstName'} | ${'User@123'}        | ${'Must contain only alphabetic characters'}
    ${'lastName'}  | ${'l'}               | ${'Must have at least 2 characters'}
    ${'lastName'}  | ${'l'.repeat(33)}    | ${'Must have a maximum of 32 characters'}
    ${'lastName'}  | ${'User@123'}        | ${'Must contain only alphabetic characters'}
    ${'phone'}     | ${'1234'}            | ${'Must be 10 digits long'}
    ${'phone'}     | ${'123456789012345'} | ${'Must be 10 digits long'}
    ${'phone'}     | ${'abcASD@123'}      | ${'Must contain only numeric characters'}
    ${'phone'}     | ${'2345764768'}      | ${'Must start with a digit between 6 and 9'}
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

  it('returns Error when email already exists', async () => {
    await UserModel.create({ ...validUser })

    const response = await postUser(validUser)
    const {
      errors: { validationErrors },
    } = response.body
    expect(validationErrors.email).toBe('E-mail already exists')
  })

  it('returns errors for both E-mail already exists and password is null', async () => {
    await UserModel.create({ ...validUser })

    const response = await postUser({
      ...validUser,
      password: null,
    })
    const {
      errors: { validationErrors },
    } = response.body
    expect(validationErrors.password).toBe('Password cannot be null')
    expect(validationErrors.email).toEqual('E-mail already exists')
  })
})
