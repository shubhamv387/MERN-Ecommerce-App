import app from '../app'
import { NODE_ENV, PORT } from '../secrets'

jest.mock('../app', () => ({
  listen: jest.fn(),
}))

describe('Node app', () => {
  test('should start the server successfully on given port', async () => {
    ;(app.listen as jest.Mock).mockImplementation((port: number, callback: () => void) => {
      callback()
    })

    const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {})

    await import('../server')

    expect(app.listen).toHaveBeenCalledWith(PORT, expect.any(Function))
    expect(logSpy).toHaveBeenCalledWith(
      `Server is running at http://localhost:${PORT} in ${NODE_ENV} environment`,
    )

    logSpy.mockRestore()
  })
})
