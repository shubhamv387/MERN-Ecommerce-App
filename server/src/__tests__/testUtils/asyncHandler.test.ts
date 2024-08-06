import { NextFunction, Request, Response } from 'express'
import asyncHandler from '../../utils/asyncHandler'
import HttpException from '../../exceptions/root'
import InternalException from '../../exceptions/InternalException'

describe('asyncHandler', () => {
  let req: Request
  let res: Response
  let next: NextFunction

  beforeEach(() => {
    req = {} as Request
    res = {} as Response
    next = jest.fn()
  })

  it('should call next() without errors when callback is a middleware and asks for next() function', async () => {
    const callback = async (_req: Request, _res: Response, next: NextFunction) => {
      // some codes and check if it is a middleware
      next()
    }

    const handler = asyncHandler(callback)

    await handler(req as Request, res as Response, next)

    expect(next).toHaveBeenCalledWith() // Ensure next() is called without arguments
  })

  it('should call next() with HttpException when callback throws HttpException', async () => {
    const error = new HttpException('Not Found', 404)
    const callback = async (_req: Request, _res: Response, _next: NextFunction) => {
      throw error
    }

    const handler = asyncHandler(callback)

    await handler(req as Request, res as Response, next)

    expect(next).toHaveBeenCalledWith(error) // Ensure next() is called with the HttpException
  })

  it('should call next() with InternalException when callback throws an internal server error', async () => {
    const error = new Error('Internal server error')
    const callback = async (_req: Request, _res: Response, _next: NextFunction) => {
      throw error
    }

    const handler = asyncHandler(callback)

    await handler(req as Request, res as Response, next)

    const internalException = new InternalException('Something went wrong!')
    expect(next).toHaveBeenCalledWith(internalException) // Ensure next() is called with InternalException
  })
})
