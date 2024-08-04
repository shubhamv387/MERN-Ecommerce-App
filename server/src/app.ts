import dotenv from 'dotenv'
dotenv.config()
import express, { Express } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import v1RootRouter from './routes/v1'
import corsOptions from './config/cors/corsOptions'
import { logger } from './middleware/logger.middleware'

const app: Express = express()

app.use(logger)
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api/v1', v1RootRouter)

export default app
