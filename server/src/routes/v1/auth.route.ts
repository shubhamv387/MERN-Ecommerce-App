import express from 'express'
import * as auth from '../../controller/auth.controller'
import {
  validateLoginInputField,
  validateRegisterInputField,
  validateResetPassInputField,
  validateSendResetPassLinkInputField,
} from '../../validations/auth.validation'
import loginLimiter from '../../middleware/loginLimiter'

const authRouter = express.Router()

authRouter.post('/register', validateRegisterInputField, auth.register)
authRouter.post('/login', loginLimiter, validateLoginInputField, auth.login)
authRouter.get('/refresh-token', auth.refreshToken)
authRouter.post('/logout', auth.logout)
authRouter
  .route('/reset-password')
  .post(validateSendResetPassLinkInputField, auth.sendResetPassLink)
  .put(validateResetPassInputField, auth.resetPassword)

export default authRouter
