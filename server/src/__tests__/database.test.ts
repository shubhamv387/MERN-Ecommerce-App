import mongoose from 'mongoose'
import connectdb from '../config/database'
import { MONGO_URI_TEST, MONGO_URL } from '../secrets'

jest.mock('mongoose', () => ({
  connect: jest.fn(),
}))

describe('Database Connection', () => {
  const originalNODE_ENV = process.env.NODE_ENV

  beforeEach(() => {
    jest.clearAllMocks()
    ;(mongoose.connect as jest.Mock).mockResolvedValueOnce('MongoDB Connected')
  })

  afterEach(() => {
    process.env.NODE_ENV = originalNODE_ENV
  })

  it('should successfully call mongoose.connect function with MONGO_URL in other environments like development or production', async () => {
    process.env.NODE_ENV = 'development'

    await connectdb()

    expect(mongoose.connect).toHaveBeenCalledWith(MONGO_URL)
  })

  it('should successfully call mongoose.connect function with MONGO_URI_TEST in test environment', async () => {
    process.env.NODE_ENV = 'test'

    await connectdb()

    expect(mongoose.connect).toHaveBeenCalledWith(MONGO_URI_TEST)
  })
})
