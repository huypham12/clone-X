import { Request, Response, NextFunction } from 'express'
import { pick } from 'lodash'

export const filterMiddlewares = (filterKeys: string[]) => (req: Request, res: Response, next: NextFunction) => {
  req.body = pick(req.body, filterKeys)
  next()
}
