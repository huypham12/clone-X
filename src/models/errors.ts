import httpStatus from '~/constants/httpStatus'
import { usersMessage } from '~/constants/messages'

type ErrorsType = Record<string, { msg: string; [key: string]: any }> //[x: string]: string

export class ErrorWithStatus {
  message: string
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

// chuẩn hóa lại cái lỗi mà express-validator trả về
export class EntityError extends ErrorWithStatus {
  errors: ErrorsType
  constructor({ message = usersMessage.VALIDATION_ERROR, errors }: { message?: string; errors: ErrorsType }) {
    super({ message, status: httpStatus.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}
