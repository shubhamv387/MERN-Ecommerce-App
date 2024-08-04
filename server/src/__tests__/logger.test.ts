import { format } from 'date-fns'
import { v4 as uuid } from 'uuid'
import * as fs from 'node:fs'
import * as fsPromises from 'node:fs/promises'
import path from 'path'
import { NextFunction, Request, Response } from 'express'
import { logEvents } from '../middleware/logger.middleware'
import * as customLogs from '../middleware/logger.middleware'

// Mock external modules
jest.mock('date-fns', () => ({
  format: jest.fn(),
}))
jest.mock('uuid', () => ({
  v4: jest.fn(),
}))
jest.mock('node:fs', () => ({
  existsSync: jest.fn(),
}))
jest.mock('node:fs/promises', () => ({
  mkdir: jest.fn(),
  appendFile: jest.fn(),
}))
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
}))

describe('logEvents function', () => {
  it('should create a log entry', async () => {
    ;(format as jest.Mock).mockReturnValue('2024-07-29\t12:00:00')
    ;(uuid as jest.Mock).mockReturnValue('1234-5678-91011')
    ;(fs.existsSync as jest.Mock).mockReturnValue(false)
    ;(fsPromises.mkdir as jest.Mock).mockResolvedValue(undefined)
    ;(fsPromises.appendFile as jest.Mock).mockResolvedValue(undefined)

    const testMessage = 'Testing logEvent function'
    const logFileName = 'testLog.log'

    await logEvents(testMessage, logFileName)

    expect(fs.existsSync).toHaveBeenCalledWith(path.join(process.cwd(), 'logs'))
    expect(fsPromises.mkdir).toHaveBeenCalledWith(path.join(process.cwd(), 'logs'))
    expect(fsPromises.appendFile).toHaveBeenCalledWith(
      path.join(process.cwd(), 'logs', logFileName),
      `2024-07-29\t12:00:00\t1234-5678-91011\t${testMessage}\n`,
    )
  })
})

describe('Logger Middleware', () => {
  let mockLogEvents: jest.SpyInstance
  let mockConsoleLog: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock console.log
    mockConsoleLog = jest.spyOn(global.console, 'log').mockImplementation(() => {})
    mockLogEvents = jest.spyOn(customLogs, 'logEvents')
  })

  const req = {
    method: 'GET',
    url: '/test',
    headers: {
      origin: 'http://testing-host.com',
    },
    path: '/test',
  } as Request
  const res = {} as Response
  const next = jest.fn() as NextFunction

  it('should call the logEvents function and log the request into reqLog.log file', async () => {
    await customLogs.logger(req, res, next)

    expect(mockLogEvents).toHaveBeenCalledWith('GET\t/test\thttp://testing-host.com', 'testLog.log')
  })

  it('should console.log requests to the node environment', async () => {
    await customLogs.logger(req, res, next)

    expect(mockConsoleLog).toHaveBeenCalledWith('GET /test')
  })
})
