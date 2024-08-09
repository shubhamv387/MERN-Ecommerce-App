import HttpException from './root'

export default class ValidationException extends HttpException {
  constructor(message: string, statusCode: number, error: any) {
    super(message, statusCode, error)
  }
}
