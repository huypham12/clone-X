import { validationResult, ValidationChain } from 'express-validator'
import { Request, Response, NextFunction } from 'express'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import { EntityError, ErrorWithStatus } from '~/models/errors'
import httpStatus from '~/constants/httpStatus'

// can be reused by many routes
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // chạy các hàm xử lý trong checkSchema
    await validation.run(req)
    const errors = validationResult(req) // lấy lỗi được trả về
    if (errors.isEmpty()) return next()
    const errorsObject = errors.mapped()
    const entityError = new EntityError({ errors: {} })
    for (const key in errorsObject) {
      const { msg } = errorsObject[key]
      if (msg instanceof ErrorWithStatus && msg.status !== httpStatus.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
      entityError.errors[key] = errorsObject[key]
    }
    next(entityError)
  }
}
