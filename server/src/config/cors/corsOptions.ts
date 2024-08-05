import { CorsOptions } from 'cors'
import { allowedOrigins } from './allowedOrigins'
import BadRequestException from '../../exceptions/BadRequest'

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allowed: boolean) => void) => {
    const isAllowed = allowedOrigins.includes(origin ?? '') || !origin
    callback(isAllowed ? null : new BadRequestException('Not allowed by CORS'), isAllowed)
  },
  // methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 204, // some legacy browsers does not support 204
}

export default corsOptions
