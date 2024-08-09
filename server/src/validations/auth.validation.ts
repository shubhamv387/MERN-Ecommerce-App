import UserModel from '../models/User.model'
import BadRequestException from '../exceptions/BadRequest'
import {
  validateEmailField,
  validateNameField,
  validatePasswordField,
  validatePhoneField,
} from './Input.validation'

export type RegistrationInputTypes = {
  field: 'email' | 'password' | 'phone' | 'firstName' | 'lastName'
  required?: boolean
}

export const validateRegistrationInputField = ({ field, required = true }: RegistrationInputTypes) => {
  switch (field) {
    case 'email':
      return validateEmailField(field).custom(async (email) => {
        const existingUser = await UserModel.findOne({ email })
        if (existingUser) throw new BadRequestException('E-mail already exists')
      })

    case 'password':
      return validatePasswordField(field)

    case 'phone':
      return validatePhoneField(field).custom(async (phone) => {
        const existingUser = await UserModel.findOne({ phone })
        if (existingUser) throw new BadRequestException('phone number already exists')
      })

    case 'lastName':
      return validateNameField(field, required)

    case 'firstName':
      return validateNameField(field, required)

    default:
      throw new BadRequestException(`Unexpected field: ${field}`)
  }
}
