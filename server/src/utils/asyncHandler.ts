import { NextFunction, Request, Response } from 'express'
import HttpException from '../exceptions/root'
import InternalException from '../exceptions/InternalException'

type ControllerMethod = (req: Request, res: Response, next: NextFunction) => Promise<unknown>

const asyncHandler = (callback: ControllerMethod) => (req: Request, res: Response, next: NextFunction) =>
  callback(req, res, next).catch((error: any) => {
    let exception: HttpException
    if (error instanceof HttpException) exception = error
    else exception = new InternalException('Something went wrong!')

    next(exception)
  })

export default asyncHandler
