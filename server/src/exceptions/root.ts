class HttpException extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message)

    this.statusCode = statusCode
    this.isOperational = isOperational

    Object.setPrototypeOf(this, HttpException.prototype) // very important line
    Error.captureStackTrace(this, this.constructor)
  }
}

export default HttpException
