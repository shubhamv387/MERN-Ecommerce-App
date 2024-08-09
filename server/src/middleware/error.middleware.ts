import { NextFunction, Request, Response } from 'express'
import { logEvents } from './logger.middleware'
import HttpException from '../exceptions/root'

type ErrorResponse = {
  success: boolean
  message: string
  errors?: any
  stack?: string
}

export default (error: HttpException, req: Request, res: Response, _next: NextFunction) => {
  logEvents(`${error.name}: ${error.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')

  console.log(error.message)

  const statusCode = error.statusCode || 500
  const errorResponse: ErrorResponse = {
    success: false,
    errors: error.errors || undefined,
    message: error.isOperational ? error.message : 'Something went wrong!',
  }

  if (process.env.NODE_ENV === 'development' && error.isOperational) {
    errorResponse.stack = error.stack
  }

  res.status(statusCode).json(errorResponse)
}
