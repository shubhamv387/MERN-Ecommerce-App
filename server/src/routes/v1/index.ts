import express from 'express'
import authRouter from './auth.route'

const v1RootRouter = express.Router()

v1RootRouter.get('/', (req, res) => {
  res.json({ message: 'working' })
})

v1RootRouter.use('/auth', authRouter)

export default v1RootRouter
