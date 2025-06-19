import httpStatus from '~/constants/httpStatus'
import { Request, Response, NextFunction } from 'express'

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || httpStatus.INTERNAL_SERVER_ERROR
  res.status(status).json({ err })
}
