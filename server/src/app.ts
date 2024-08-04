import dotenv from 'dotenv'
dotenv.config()
import express, { Express } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import v1RootRouter from './routes/v1'

const app: Express = express()

app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api/v1', v1RootRouter)

export default app
