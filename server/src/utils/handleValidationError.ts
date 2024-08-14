import { validationResult } from 'express-validator'
import { Request } from 'express'
import ValidationException from '../exceptions/ValidationException'

export default function handleValidationError(req: Request) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const validationErrors: { [key: string]: string } = {}
    errors.array().forEach((error: any) => {
      validationErrors[error.path] = error.msg
    })
    // console.log(validationErrors)
    throw new ValidationException('validation errors', 400, { validationErrors })
  }
}
