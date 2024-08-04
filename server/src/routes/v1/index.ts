import express from 'express'

const v1RootRouter = express.Router()

v1RootRouter.get('/', (req, res, next) => {
  res.json({ message: 'working' })
})

export default v1RootRouter
