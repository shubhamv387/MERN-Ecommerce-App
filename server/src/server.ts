import mongoose from 'mongoose'
import app from './app'
import connectdb from './config/database'
import { logEvents } from './middleware/logger.middleware'
import { NODE_ENV, PORT } from './secrets'

const server = async () => {
  try {
    await connectdb()
    if (mongoose.connection.readyState === 1)
      app.listen(PORT, () =>
        console.log(`Server is running at http://localhost:${PORT} in ${NODE_ENV} environment`),
      )
  } catch (error: any) {
    console.log(NODE_ENV)
    logEvents(`${error.errno}: ${error.code}\t${error.syscall}\t${error.hostname}`, 'mongoErrLog.log')
    console.log(`${error.name}: ${error.message}`)
    process.exit(1)
  }
}

server()

export default server
