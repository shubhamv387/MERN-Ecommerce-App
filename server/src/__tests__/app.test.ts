import { NextFunction, Request, Response } from 'express'
import app from '../app'
import request from 'supertest'

jest.mock('../middleware/logger.middleware', () => ({
  logEvents: jest.fn(),
  logger: (req: Request, res: Response, next: NextFunction) => next(),
}))

describe('Invalid route --> /invalid-route-request', () => {
  it('should give the status code as 404, and a response object containing success and message', async () => {
    const response = await request(app).get('/invalid-route')

    expect(response.statusCode).toBe(404)
    expect(Object.keys(response.body)).toEqual(expect.arrayContaining(['message', 'success']))
  })

  it('should give the success to be falsy', async () => {
    const response = await request(app).get('/invalid-route')

    expect(response.body).toHaveProperty('success')
    expect(response.body.success).toBeFalsy
  })

  it('should give the message --> Requested URL not found!', async () => {
    const response = await request(app).get('/invalid-route')

    expect(response.body).toHaveProperty('message')
    expect(response.body.message).toStrictEqual('Requested URL /invalid-route not found!')
  })
})
