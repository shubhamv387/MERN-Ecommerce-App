import request from 'supertest'
import app from '../../app'
import UserModel from '../../models/User.model'
import { closeServer, startServer } from '../../server'
import { NextFunction, Request, Response } from 'express'
import InternalException from '../../exceptions/InternalException'
import HttpException from '../../exceptions/root'
import { Role } from '../../types/user.types'

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
  role?: Role
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
  beforeEach(async () => await UserModel.collection.deleteMany({}))

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
    ${'firstName'} | ${null}              | ${'Must have at least 2 characters'}
    ${'firstName'} | ${'f'}               | ${'Must have at least 2 characters'}
    ${'firstName'} | ${'f'.repeat(33)}    | ${'Must have a maximum of 32 characters'}
    ${'firstName'} | ${'User@123'}        | ${'Must contain only alphabetic characters'}
    ${'lastName'}  | ${null}              | ${'Must have at least 2 characters'}
    ${'lastName'}  | ${'l'}               | ${'Must have at least 2 characters'}
    ${'lastName'}  | ${'l'.repeat(33)}    | ${'Must have a maximum of 32 characters'}
    ${'lastName'}  | ${'User@123'}        | ${'Must contain only alphabetic characters'}
    ${'phone'}     | ${null}              | ${'Phone cannot be null'}
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

  it('returns Error when phone number already exists', async () => {
    const user = { ...validUser, phone: '9876543478' }

    await UserModel.create(user)

    const response = await postUser({ ...user, email: 'newemail@mail.com' })
    const {
      errors: { validationErrors },
    } = response.body
    expect(validationErrors.phone).toBe('phone number already exists')
  })

  it('returns Error when email already exists', async () => {
    await UserModel.create({ ...validUser })

    const response = await postUser(validUser)
    const {
      errors: { validationErrors },
    } = response.body
    expect(validationErrors.email).toBe('E-mail already exists')
  })

  it('returns errors for both E-mail and phone number already exists and password is null', async () => {
    await UserModel.create({ ...validUser, phone: '9875847362' })

    const response = await postUser({
      ...validUser,
      phone: '9875847362',
      password: null,
    })
    const {
      errors: { validationErrors },
    } = response.body
    expect(validationErrors.password).toBe('Password cannot be null')
    expect(validationErrors.email).toEqual('E-mail already exists')
    expect(validationErrors.phone).toEqual('phone number already exists')
  })

  it('returns error when user is not stored into the database', async () => {
    const postUser = jest.fn(async () => {
      throw new InternalException('Unable to register new user, please try again later')
    })
    try {
      await postUser()
      const savedUser = await UserModel.findOne({ email: validUser.email })
      expect(savedUser).toBe(null)
    } catch (error: any) {
      expect(error).toBeInstanceOf(HttpException)
      expect(error.message).toBe('Unable to register new user, please try again later')
      expect(error.statusCode).toBe(500)
    }
  })

  /* ------------------------------------------------------------------------ */

  it('hashes the password then storing user data with hashed password to the database', async () => {
    await postUser()
    const savedUser = await UserModel.findOne({ email: validUser.email })

    expect(savedUser!.email).toBe(validUser.email)
    expect(savedUser!.password).not.toBe(validUser.password)
    expect(savedUser!).toHaveProperty('role')
    expect(savedUser!.role).toEqual(Role.Customer)
  })

  it('saves the user to database', async () => {
    await postUser()
    const userList = await UserModel.find()
    expect(userList.length).toBe(1)
  })

  it('returns 201 when new user created successfully', async () => {
    const response = await postUser()
    expect(response.status).toBe(201)
  })

  it('returns something in response body when new user created successfully', async () => {
    const response = await postUser()

    expect(Object.keys(response.body)).toHaveLength(4)
    expect(Object.keys(response.body)).toEqual(
      expect.arrayContaining(['success', 'message', 'user', 'token']),
    )
  })

  it('returns success true when new user created successfully', async () => {
    const response = await postUser()
    expect(response.body.success).toBeTruthy()
  })

  /* ----------------------------------------------------------------------- */
})
