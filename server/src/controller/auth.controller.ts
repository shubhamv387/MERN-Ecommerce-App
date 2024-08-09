import { Request, Response } from 'express'
import bcrypt, { genSaltSync } from 'bcryptjs'
import jwt from 'jsonwebtoken'
import asyncHandler from '../utils/asyncHandler'
import { validationResult } from 'express-validator'
import ValidationException from '../exceptions/ValidationException'
import UserModel from '../models/User.model'
import { JWT_SECRET_KEY } from '../secrets'

// @desc    Register a new User
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const validationErrors: { [key: string]: string } = {}
    errors.array().forEach((error: any) => {
      validationErrors[error.path] = error.msg
    })

    throw new ValidationException('validation errors', 400, { validationErrors })
  }

  const encryptedPass = bcrypt.hashSync(req.body.password, genSaltSync(10))
  const user = await UserModel.create({ ...req.body, password: encryptedPass })
  const createdUser = await UserModel.findById(user._id)
  const token = jwt.sign({ userId: user._id }, JWT_SECRET_KEY, {
    expiresIn: '30d',
  })

  return res.status(201).json({ success: 1, user: createdUser, token })
})
