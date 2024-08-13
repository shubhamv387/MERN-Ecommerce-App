import HttpException from './root'

export default class UnauthorizedException extends HttpException {
  constructor(message: string) {
    super(message, 401)
  }
}
