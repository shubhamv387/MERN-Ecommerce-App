import { NextFunction, Request, Response } from 'express'
import errorMiddleware from '../../middleware/error.middleware'
import { logEvents } from '../../middleware/logger.middleware'
import HttpException from '../../exceptions/root'
import InternalException from '../../exceptions/InternalException'
import BadRequestException from '../../exceptions/BadRequest'

jest.mock('../../middleware/logger.middleware', () => ({
  logEvents: jest.fn().mockResolvedValue(undefined),
}))

describe('Error Middleware', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let next: NextFunction

  beforeEach(() => {
    req = {
      method: 'GET',
      url: '/test',
      headers: {
        origin: 'http://testing-host.com',
      },
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    next = jest.fn()
  })

  afterEach(() => {
    jest.resetModules()
    process.env.NODE_ENV = 'test'
  })

  it('should log the error and send response with status code 404', () => {
    const error = new HttpException('Not Found', 404)

    errorMiddleware(error, req as Request, res as Response, next)

    expect(logEvents).toHaveBeenCalledWith(
      'Error: Not Found\tGET\t/test\thttp://testing-host.com',
      'errLog.log',
    )
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not Found',
    })
  })

  it('should log the error and send response with status code 500 for non-operational error', () => {
    const error = new InternalException('Something went wrong!')

    errorMiddleware(error, req as Request, res as Response, next)

    expect(logEvents).toHaveBeenCalledWith(
      'Error: Something went wrong!\tGET\t/test\thttp://testing-host.com',
      'errLog.log',
    )
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Something went wrong!',
    })
  })

  it('should include stack trace in response in development mode for operational error', async () => {
    process.env.NODE_ENV = 'development'

    const error = new BadRequestException('Not Found')

    errorMiddleware(error, req as Request, res as Response, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Not Found',
      stack: error.stack,
      success: false,
    })
  })
})
