import mongoose from 'mongoose'
import { MONGO_URI_TEST, MONGO_URL } from '../secrets'

const connectdb = (): Promise<unknown> =>
  mongoose.connect(process.env.NODE_ENV === 'test' ? MONGO_URI_TEST : MONGO_URL)

export default connectdb

// import mongoose from 'mongoose'
// import { logEvents } from '../middleware/logger.middleware'
// import { MONGO_URI_TEST, MONGO_URL, NODE_ENV } from '../secrets'

// const connectdb = async (callback?: () => void) => {
//   try {
//     await mongoose.connect(NODE_ENV === 'test' ? MONGO_URI_TEST : MONGO_URL)
//     if (callback) callback()
//   } catch (error: any) {
//     logEvents(`${error.errno}: ${error.code}\t${error.syscall}\t${error.hostname}`, 'mongoErrLog.log')

//     console.log(`${error.name}: ${error.message}`)
//     process.exit(1)
//   }
// }

// export default connectdb
