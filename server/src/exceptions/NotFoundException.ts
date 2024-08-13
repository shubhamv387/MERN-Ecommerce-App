import HttpException from './root'

export default class NotFoundException extends HttpException {
  constructor(message: string) {
    super(message, 404)
  }
}
