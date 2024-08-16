import { check } from 'express-validator'
import { Role } from '../types/user.types'

type ValidatePropTypes = {
  field: string
  label: string
  required?: boolean
}

export const validateNameField = ({ field, label, required = true }: ValidatePropTypes) => {
  return check(field)
    .optional(!required)
    .notEmpty()
    .withMessage(`${label} cannot be null`)
    .isLength({ min: 2 })
    .withMessage('Must have at least 2 characters')
    .bail()
    .isLength({ max: 32 })
    .withMessage('Must have a maximum of 32 characters')
    .bail()
    .matches(/^[a-zA-Z ]+$/)
    .withMessage('Must contain only alphabetic characters')
}

export const validateEmailField = ({ field, label, required = true }: ValidatePropTypes) => {
  return check(field)
    .optional(!required)
    .notEmpty()
    .withMessage(`${label} cannot be null`)
    .bail()
    .isEmail()
    .withMessage(`${label} is not valid`)
    .bail()
}

export const validatePhoneField = ({ field, label, required = true }: ValidatePropTypes) => {
  return check(field)
    .optional(!required)
    .notEmpty()
    .withMessage(`${label} cannot be null`)
    .bail()
    .isLength({ min: 10, max: 10 })
    .withMessage('Must be 10 digits long')
    .bail()
    .matches(/^[0-9]+$/)
    .withMessage('Must contain only numeric characters')
    .bail()
    .matches(/^[6-9]/)
    .withMessage('Must start with a digit between 6 and 9')
    .bail()
}

export const validatePasswordField = ({ field, label }: ValidatePropTypes) => {
  return check(field)
    .notEmpty()
    .withMessage(`${label} cannot be null`)
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .withMessage(`${label} must have at least 1 uppercase, 1 lowercase, and 1 number character`)
    .bail()
    .isLength({ min: 6 })
    .withMessage(`${label} must be at least 6 characters`)
    .bail()
}

export const validateImageUrlField = ({ field, label, required = true }: ValidatePropTypes) => {
  return check(field)
    .optional(!required)
    .notEmpty()
    .withMessage(`${label} cannot be null`)
    .bail()
    .matches(/^(https?:\/\/)[^\s/$.?#].[^\s]*\.(jpg|jpeg|png)$/i)
    .withMessage(`${label} is invalid`)
    .isLength({ max: 255 })
    .withMessage(`${label} is invalid`)
    .bail()
}

export const validateRoleField = ({ field, label = 'Role', required = false }: ValidatePropTypes) => {
  return check(field)
    .optional(!required)
    .isIn(Object.values(Role))
    .withMessage(`This ${label} does not exist`)
}
