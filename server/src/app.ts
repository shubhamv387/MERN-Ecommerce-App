import dotenv from 'dotenv'
dotenv.config()
import express, { Express, Request } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import v1RootRouter from './routes/v1'
import corsOptions from './config/cors/corsOptions'
import { logger } from './middleware/logger.middleware'
import errorMiddleware from './middleware/error.middleware'
import HttpException from './exceptions/root'

const app: Express = express()

app.use(logger)
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api/v1', v1RootRouter)

app.use((req: Request, _res, _next) => {
  throw new HttpException(`Requested URL ${req.path} not found!`, 404)
})

// Error Handling Middleware
app.use(errorMiddleware)

export default app
