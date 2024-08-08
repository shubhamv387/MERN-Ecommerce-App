import { Request, Response } from 'express'
import asyncHandler from '../utils/asyncHandler'
import { validationResult } from 'express-validator'
import ValidationException from '../exceptions/ValidationException'

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

  return res.status(201).json({ success: 1 })
})
