import request from 'supertest'
import express from 'express'
import loginLimiter from '../../middleware/loginLimiter'

// Create an express app for testing
const app = express()
app.use('/login', loginLimiter, (req, res) =>
  res.status(200).json({ success: true, message: 'Login successful' }),
)

describe('loginLimiter Middleware', () => {
  beforeEach(() => jest.clearAllMocks())

  it('should allow requests under the rate limit', async () => {
    for (let i = 0; i < 5; i++) {
      const response = await request(app).post('/login')

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Login successful')
    }
  })

  it('should block requests after exceeding the rate limit', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).post('/login')
    }

    // The 6th request should trigger the rate limit
    const response = await request(app).post('/login')

    expect(response.status).toBe(429)
    expect(response.body.message).toBe('Too many login attempts, please try again after 60 seconds')
  })
})
