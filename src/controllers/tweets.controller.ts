import { Request, Response, NextFunction } from 'express'

export const createTweetsController = async (req: Request, res: Response, next: NextFunction) => {
  res.send('ok')
}
