import express from 'express'
import { body, validationResult, ContextRunner, ValidationChain } from 'express-validator'
import { Request, Response, NextFunction } from 'express'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'

// can be reused by many routes
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // chạy các hàm xử lý trong checkSchema
    await validation.run(req)
    const errors = validationResult(req) // lấy lỗi được trả về
    if (errors.isEmpty()) return next()
    res.status(400).json({ errors: errors.mapped() })
  }
}
