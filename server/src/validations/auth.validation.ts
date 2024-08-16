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

const validateRegistrationInputField = ({ field, label, required = true }: RegistrationInputTypes) => {
  switch (field) {
    case 'email':
      return validateEmailField({ field, label }).custom(async (email) => {
        const existingUser = await UserModel.findOne({ email })
        if (existingUser) throw new AlreadyExistException('E-mail already exists')
      })

    case 'password':
      return validatePasswordField({ field, label })

    case 'phone':
      return validatePhoneField({ field, label, required }).custom(async (phone) => {
        const existingUser = await UserModel.findOne({ phone })
        if (existingUser) throw new AlreadyExistException('phone number already exists')
      })

    case 'firstName':
    case 'lastName':
      return validateNameField({ field, label, required })

    default:
      throw new BadRequestException(`Unexpected field: ${field}`)
  }
}

const registrationFieldsArr: RegistrationInputTypes[] = [
  { field: 'email', label: 'E-mail' },
  { field: 'password', label: 'Password' },
  { field: 'phone', required: false, label: 'Phone' },
  { field: 'firstName', required: false, label: 'First Name' },
  { field: 'lastName', required: false, label: 'Last Name' },
]

export const validateRegisterInputField = registrationFieldsArr.map((input) =>
  validateRegistrationInputField({ field: input.field, label: input.label, required: input.required }),
)

export const validateLoginInputField = [
  body('error').custom((value, { req }) => {
    if (req.body.email === undefined && req.body.phone === undefined) {
      throw new BadRequestException('Either email or phone must be provided')
    }
    return true
  }),
  validateEmailField({ field: 'email', label: 'E-mail', required: false }),
  validatePhoneField({ field: 'phone', label: 'Phone', required: false }),
  validatePasswordField({ field: 'password', label: 'Password' }),
]

export const validateSendResetPassLinkInputField = [
  body('error').custom((value, { req }) => {
    if (req.body.email === undefined && req.body.phone === undefined) {
      throw new BadRequestException('Either email or phone must be provided')
    }
    return true
  }),
  validateEmailField({ field: 'email', label: 'E-mail', required: false }),
  validatePhoneField({ field: 'phone', label: 'Phone', required: false }),
]

export const validateResetPassInputField = [
  validatePasswordField({ field: 'password', label: 'Password' }),
  validatePasswordField({ field: 'confirmPassword', label: 'Confirm Password' }).custom(
    (confirmPassword, { req }) => {
      if (req.body.password && confirmPassword !== req.body.password) {
        throw new BadRequestException('Passwords do not match')
      }
      return true
    },
  ),
]
