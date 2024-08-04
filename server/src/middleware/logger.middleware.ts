import { format } from 'date-fns'
import { v4 as uuid } from 'uuid'
import * as fs from 'node:fs'
import * as fsPromises from 'node:fs/promises'
import * as path from 'path'
import { NextFunction, Request, Response } from 'express'

export const logEvents = async (message: string, logFileName: string) => {
  const dateTime = `${format(new Date(), 'yyyy-MM-dd\tHH:mm:ss')}`
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`

  try {
    if (!fs.existsSync(path.join(process.cwd(), 'logs'))) {
      await fsPromises.mkdir(path.join(process.cwd(), 'logs'))
    }

    await fsPromises.appendFile(path.join(process.cwd(), 'logs', logFileName), logItem)
  } catch (error) {
    console.log(error)
  }
}

export const logger = async (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'test')
    await logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'testLog.log')
  else await logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log')
  console.log(`${req.method} ${req.path}`)
  next()
}
