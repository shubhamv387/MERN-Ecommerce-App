import app from '../app'
import { PORT } from '../secrets'
import { logEvents } from '../middleware/logger.middleware'
import connectdb from '../config/database'
import server from '../server'

jest.mock('../app', () => ({
  listen: jest.fn(),
}))

jest.mock('mongoose', () => ({
  connection: { readyState: 1 },
}))

jest.mock('../config/database')

jest.mock('../middleware/logger.middleware', () => ({
  logEvents: jest.fn(),
}))

describe('Server startup', () => {
  it('should start the server when the database connects successfully', async () => {
    ;(app.listen as jest.Mock).mockImplementation((port: number, callback: () => void) => {
      callback()
    })

    const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {})

    // Mocking connectdb to return a promise that resolves
    ;(connectdb as jest.Mock).mockResolvedValueOnce(undefined)

    await server()

    expect(connectdb).toHaveBeenCalled()
    expect(app.listen).toHaveBeenCalledWith(PORT, expect.any(Function))
    expect(logSpy).toHaveBeenCalledWith(
      `Server is running at http://localhost:${PORT} in ${process.env.NODE_ENV} environment`,
    )

    logSpy.mockRestore()
  })

  it('should handle connection errors', async () => {
    const mockError = new Error('Connection failed') as any
    mockError.name = 'Error'
    mockError.code = 'ECONNREFUSED'
    mockError.syscall = 'connect'
    mockError.hostname = 'localhost'

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {}) as any)
    const mockLogEvents = (logEvents as jest.Mock).mockReturnValue(undefined)

    // Mocking connectdb to return a promise that rejects
    ;(connectdb as jest.Mock).mockRejectedValue(mockError)

    await server()

    expect(connectdb).toHaveBeenCalled()
    expect(mockLogEvents).toHaveBeenCalledWith(
      `${mockError.errno || 'undefined'}: ${mockError.code}\t${mockError.syscall}\t${mockError.hostname}`,
      'mongoErrLog.log',
    )
    expect(logSpy).toHaveBeenCalledWith(`${mockError.name}: ${mockError.message}`)
    expect(processExitSpy).toHaveBeenCalledWith(1)
  })
})
