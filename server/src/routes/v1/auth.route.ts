import express from 'express'
import * as auth from '../../controller/auth.controller'
import { RegistrationInputTypes, validateRegistrationInputField } from '../../validations/auth.validation'

const authRouter = express.Router()

const registrationFieldsArr: RegistrationInputTypes[] = [
  { field: 'email' },
  { field: 'password' },
  { field: 'phone', required: false },
  { field: 'firstName', required: false },
  { field: 'lastName', required: false },
]

authRouter.post(
  '/register',
  registrationFieldsArr.map((input) =>
    validateRegistrationInputField({ field: input.field, required: input.required }),
  ),
  auth.register,
)

export default authRouter
