import express from 'express'
import * as auth from '../../controller/auth.controller'
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from '../../middleware/schemaValidations/userRegistration.validation'

const authRouter = express.Router()

authRouter.post(
  '/register',
  [
    validateEmail('email'),
    validatePassword('password'),
    validatePhone('phone'),
    validateName('firstName', true),
    validateName('lastName', true),
  ],
  auth.register,
)

export default authRouter
