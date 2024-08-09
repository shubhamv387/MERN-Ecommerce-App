class HttpException extends Error {
  statusCode: number
  errors: any
  isOperational: boolean

  constructor(message: string, statusCode: number, errors?: any, isOperational: boolean = true) {
    super(message)

    this.statusCode = statusCode
    this.errors = errors
    this.isOperational = isOperational

    Object.setPrototypeOf(this, HttpException.prototype) // very important line
    Error.captureStackTrace(this, this.constructor)
  }
}

export default HttpException
