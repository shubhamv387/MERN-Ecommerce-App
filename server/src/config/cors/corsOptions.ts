import { CorsOptions } from 'cors'
import { allowedOrigins } from './allowedOrigins'

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allowed: boolean) => void) => {
    const isAllowed = allowedOrigins.includes(origin ?? '') || !origin
    callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed)
  },
  // methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  credentials: true,
}

export default corsOptions
