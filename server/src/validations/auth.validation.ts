import UserModel from '../models/User.model'
import BadRequestException from '../exceptions/BadRequest'
import {
  validateEmailField,
  validateNameField,
  validatePasswordField,
  validatePhoneField,
} from './Input.validation'
import AlreadyExistException from '../exceptions/AlreadyExistException'
import { RegistrationInputTypes } from '../types/auth.types'
import { body } from 'express-validator'

const validateRegistrationInputField = ({ field, required = true }: RegistrationInputTypes) => {
  switch (field) {
    case 'email':
      return validateEmailField(field).custom(async (email) => {
        const existingUser = await UserModel.findOne({ email })
        if (existingUser) throw new AlreadyExistException('E-mail already exists')
      })

    case 'password':
      return validatePasswordField(field)

    case 'phone':
      return validatePhoneField(field, required).custom(async (phone) => {
        const existingUser = await UserModel.findOne({ phone })
        if (existingUser) throw new AlreadyExistException('phone number already exists')
      })

    case 'firstName':
    case 'lastName':
      return validateNameField(field, required)

    default:
      throw new BadRequestException(`Unexpected field: ${field}`)
  }
}

const registrationFieldsArr: RegistrationInputTypes[] = [
  { field: 'email' },
  { field: 'password' },
  { field: 'phone', required: false },
  { field: 'firstName', required: false },
  { field: 'lastName', required: false },
]

export const validateRegisterInputField = registrationFieldsArr.map((input) =>
  validateRegistrationInputField({ field: input.field, required: input.required }),
)

export const validateLoginInputField = [
  body().custom(({ email, phone }) => {
    if (!email && !phone) {
      throw new BadRequestException('Either email or phone must be provided')
    }
    return true
  }),
  validateEmailField('email', false),
  validatePhoneField('phone', false),
  validatePasswordField('password'),
]
