import { RequestHandler, Request, Response, NextFunction } from 'express'

// tạo một cái wrap để bắt lỗi chủ động mà không phải try catch nhiều lần
export const wrap = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
