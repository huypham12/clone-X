import httpStatus from '~/constants/httpStatus'
import { Request, Response, NextFunction } from 'express'

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // trả về cái lỗi được đẩy từ hàm next() lên hoặc lỗi mặc định
  res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR).json(err)
}
