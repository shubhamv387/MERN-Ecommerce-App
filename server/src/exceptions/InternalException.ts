import HttpException from './root'

export default class InternalException extends HttpException {
  constructor(message: string) {
    super(message, 500, null, false)
  }
}
