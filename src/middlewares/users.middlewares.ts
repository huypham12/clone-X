import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import usersService from '~/services/users.services'
import { ErrorWithStatus } from '~/models/errors'
import { usersMessage } from '~/constants/messages'

// middleware này trả về lỗi khi thiếu email, mật khẩu
export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).json({
      error: 'Missing email or password'
    })
    return

    // return  res.status(400).json({
    //   error: 'Missing email or password'
    // })
    // ghi như này là sai vì express tới ts mong muốn trả về void hoặc promise<void> (nghĩa là k trả về gì) chứ không phải một response
  }
  // chuyển qua middleware hoặc controller tiếp theo
  next()
}

// lên trang https://github.com/validatorjs/validator.js để đọc mấy cái hàm
export const registerValidator = validate(
  // hàm checkSchema được truyền vào cái hàm validate để đọc cái chuỗi lỗi (vì check schema là kiểu viết khác của validation chain thôi), hàm validate này trả về một hàm async chờ xử lý lỗi nếu pass thì tới request handler không thì tới errors handler tổng
  checkSchema({
    // các message được tách riêng đối với từng loại lỗi
    name: {
      notEmpty: {
        errorMessage: usersMessage.NAME_IS_REQUIRED
      },
      isString: {
        errorMessage: usersMessage.NAME_MUST_BE_STRING
      },
      isLength: {
        options: { min: 1, max: 100 },
        errorMessage: usersMessage.NAME_LENGTH_MUST_BE_FROM_1_TO_100
      },
      trim: true
    },

    email: {
      notEmpty: {
        errorMessage: usersMessage.EMAIL_IS_REQUIRED
      },
      isEmail: {
        errorMessage: usersMessage.EMAIL_MUST_BE_VALID
      },
      trim: true,
      custom: {
        options: async (value) => {
          const isExitEmail = await usersService.checkEmailExit(value)
          if (isExitEmail) {
            throw new ErrorWithStatus({
              message: usersMessage.EMAIL_ALREADY_EXISTS,
              status: 409
            })
          }
          return true
        }
      }
    },

    password: {
      notEmpty: {
        errorMessage: usersMessage.PASSWORD_IS_REQUIRED
      },
      isString: {
        errorMessage: usersMessage.PASSWORD_MUST_BE_STRING
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage: usersMessage.PASSWORD_MUST_BE_STRONG
      }
    },

    confirm_password: {
      notEmpty: {
        errorMessage: usersMessage.CONFIRM_PASSWORD_IS_REQUIRED
      },
      isString: {
        errorMessage: usersMessage.CONFIRM_PASSWORD_MUST_BE_STRING
      },
      isLength: {
        options: { min: 6, max: 50 },
        errorMessage: usersMessage.CONFIRM_PASSWORD_LENGTH
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage: usersMessage.CONFIRM_PASSWORD_MUST_BE_STRONG
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error(usersMessage.CONFIRM_PASSWORD_DOES_NOT_MATCH)
          }
          return true
        }
      }
    },

    date_of_birth: {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        },
        errorMessage: usersMessage.DATE_OF_BIRTH_MUST_BE_ISO8601
      }
    }
  })
)
