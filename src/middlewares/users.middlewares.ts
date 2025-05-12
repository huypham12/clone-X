import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import usersService from '~/services/users.services'

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
export const registorValidator = validate(
  checkSchema({
    name: {
      isString: true,
      isLength: {
        options: { min: 1, max: 100 }
      },
      trim: true,
      errorMessage: 'Name length must be between 1 and 100 characters'
    },
    email: {
      notEmpty: true,
      isEmail: true,
      trim: true,
      errorMessage: 'Incorrect email format',
      custom: {
        options: async (value) => {
          const isExitEmail = await usersService.checkEmailExit(value)
          if (isExitEmail) {
            throw new Error('Email already exists')
          }
          return true
        }
      }
    },
    password: {
      notEmpty: true,
      isString: true,
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage:
          'Password must be at least 6 characters and must contain at least 1 uppercase letter 1 lowercase letter 1 number and 1 character'
      }
    },
    confirm_password: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: { min: 6, max: 50 }
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        }
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password')
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
        }
      },
      errorMessage: 'Date of birth is not in yyyy-mm-dd format'
    }
  })
)
