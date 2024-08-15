import { Response } from 'express'
import rateLimit from 'express-rate-limit'
// import TooManyRequestsException from '../exceptions/TooManyRequestsException'

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  message: {
    message: 'Too many login attempts, please try again after 60 seconds',
  },

  handler(req, res: Response, next, options: any) {
    // throw new TooManyRequestsException(options.message.message)
    return res.status(429).json({ success: false, message: options.message.message })
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
})

export default loginLimiter
