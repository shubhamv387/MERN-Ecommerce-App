import HttpException from './root'

export default class AlreadyExistException extends HttpException {
  constructor(message: string) {
    super(message, 409)
  }
}
