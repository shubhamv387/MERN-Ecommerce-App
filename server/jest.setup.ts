import mongoose from 'mongoose'
import { mockConsoleLog } from './src/__mocks__/consoleLogMock'

import dotenv from 'dotenv'

dotenv.config() // important

mockConsoleLog()

afterAll(async () => {
  if (mongoose.connection?.readyState === 1) {
    await mongoose.connection.db.dropDatabase()
    await mongoose.disconnect()
  }
})
