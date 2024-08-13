import express from 'express'
import * as auth from '../../controller/auth.controller'
import { validateLoginInputField, validateRegisterInputField } from '../../validations/auth.validation'
import loginLimiter from '../../middleware/loginLimit'

const authRouter = express.Router()

authRouter.post('/register', validateRegisterInputField, auth.register)
authRouter.post('/login', loginLimiter, validateLoginInputField, auth.login)
authRouter.get('/refresh-token', auth.refreshToken)
authRouter.post('/logout', auth.logout)

export default authRouter
