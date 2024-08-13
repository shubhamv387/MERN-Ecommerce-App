import HttpException from './root'

export default class ForbiddenException extends HttpException {
  constructor(message: string) {
    super(message, 403)
  }
}
