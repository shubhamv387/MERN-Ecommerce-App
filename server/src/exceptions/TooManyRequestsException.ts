import HttpException from './root'

export default class TooManyRequestsException extends HttpException {
  constructor(message: string) {
    super(message, 429)
  }
}
