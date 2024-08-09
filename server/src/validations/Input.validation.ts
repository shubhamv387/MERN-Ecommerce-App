import { check } from 'express-validator'
import UserModel from '../models/User.model'
import BadRequestException from '../exceptions/BadRequest'

export const validateNameField = (field: string, required: boolean = true) => {
  let validationChain = check(field)

  if (!required) {
    validationChain = validationChain.optional()
  }

  return validationChain
    .isLength({ min: 2 })
    .withMessage('Must have at least 2 characters')
    .bail()
    .isLength({ max: 32 })
    .withMessage('Must have a maximum of 32 characters')
    .bail()
    .matches(/^[a-zA-Z ]+$/)
    .withMessage('Must contain only alphabetic characters')
}

export const validateEmailField = (field: string, required: boolean = true) => {
  let validationChain = check(field)

  if (!required) {
    validationChain = validationChain.optional()
  }

  return validationChain
    .notEmpty()
    .withMessage('E-mail cannot be null')
    .bail()
    .isEmail()
    .withMessage('E-mail is not valid')
    .bail()
}

export const validatePhoneField = (field: string, required: boolean = true) => {
  let validationChain = check(field)

  if (!required) {
    validationChain = validationChain.optional()
  }

  return validationChain
    .optional()
    .isLength({ min: 10, max: 10 })
    .withMessage('Must be 10 digits long')
    .bail()
    .matches(/^[0-9]+$/)
    .withMessage('Must contain only numeric characters')
    .bail()
    .matches(/^[6-9]/)
    .withMessage('Must start with a digit between 6 and 9')
    .bail()
    .custom(async (phone) => {
      const existingUser = await UserModel.findOne({ phone })
      if (existingUser) throw new BadRequestException('phone number already exists')
    })
}

export const validatePasswordField = (field: string) =>
  check(field)
    .notEmpty()
    .withMessage('Password cannot be null')
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .withMessage('Password must have at least 1 uppercase, 1 lowercase, and 1 number character')
    .bail()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
