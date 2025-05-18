import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import usersService from '~/services/users.services'
import { ErrorWithStatus } from '~/models/errors'
import { usersMessage } from '~/constants/messages'
import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import httpStatus from '~/constants/httpStatus'

// middleware này trả về lỗi khi thiếu email, mật khẩu
export const loginValidator = validate(
  checkSchema({
    email: {
      isEmail: {
        errorMessage: usersMessage.EMAIL_MUST_BE_VALID
      },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const user = await databaseService.users.findOne({ email: value, password: hashPassword(req.body.password) }) // kiểm tra xem có users luôn nữa đỡ phải check lại để lấy giá trị users
          if (user === null) {
            throw new ErrorWithStatus({
              message: usersMessage.USER_DOES_NOT_EXIST,
              status: 401
            })
          }
          // gán cái user này vào trong req để đi tiếp tới controller, khi này k phải check lại user để lấy id nữa
          req.user = user
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
      }
    }
  })
)

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
  }, ['body'])
)

// Helper function to validate Bearer token format
const validateBearerToken = (value: string) => {
  if (!value) {
    throw new ErrorWithStatus({
      message: usersMessage.ACCESS_TOKEN_IS_REQUIRED,
      status: httpStatus.UNAUTHORIZED
    })
  }

  const [bearer, token] = value.split(' ')
  if (!token || bearer !== 'Bearer') {
    throw new ErrorWithStatus({
      message: 'Invalid token format. Must be: Bearer <token>',
      status: httpStatus.UNAUTHORIZED
    })
  }

  return token
}

// Helper function to verify access token
const verifyAccessToken = async (token: string) => {
  try {
    return await verifyToken({ token, secretKey: process.env.JWT_SECRET_ACCESS_TOKEN as string })
  } catch (error) {
    throw new ErrorWithStatus({
      message: usersMessage.UNAUTHORIZED,
      status: httpStatus.UNAUTHORIZED
    })
  }
}

// Helper function to verify refresh token
const verifyRefreshToken = async ({ token, secretKey, }: { token: string, secretKey: string }) => {
  try {
    // Kiểm tra refresh token trong database trước
    const refreshToken = await databaseService.refreshTokens.findOne({ token })
    if (!refreshToken) {
      throw new ErrorWithStatus({
        message: usersMessage.REFRESH_TOKEN_IS_REQUIRED,
        status: httpStatus.UNAUTHORIZED
      })
    }

    // Sau đó mới verify token
    const decodedToken = await verifyToken({ token, secretKey })
    return decodedToken
  } catch (error) {
    if (error instanceof ErrorWithStatus) {
      throw error
    }
    throw new ErrorWithStatus({
      message: usersMessage.UNAUTHORIZED,
      status: httpStatus.UNAUTHORIZED
    })
  }
}

// Helper function to email verify token
const emailVerifyToken = async ({ token, secretKey, }: { token: string, secretKey: string }) => {
  try {
    const decodedToken = await verifyToken({ token, secretKey })
    return decodedToken
  } catch (error) {
    if (error instanceof ErrorWithStatus) {
      throw error
    }
    throw new ErrorWithStatus({
      message: usersMessage.UNAUTHORIZED,
      status: httpStatus.UNAUTHORIZED
    })
  }
}


// kiểm tra ở vị trí nào thì truyền vào vị trí đó thôi, đỡ phải kiểm tra hết, tăng hiệu xuất
// jwt là self-contained, mình chỉ cần decode nó trong đấy nó chứa hết thông tin xác thực rồi nếu đúng thì được đi tiếp
export const accessTokenValidator = validate(checkSchema({
  Authorization: {
    custom: {
      options: async (value, { req }) => {
        const token = validateBearerToken(value)
        const decodedToken = await verifyAccessToken(token)
        req.decoded_authorization = decodedToken
        return true
      }
    }
  }
}, ['headers']))

export const refreshTokenValidator = validate(checkSchema({
  refresh_token: {
    notEmpty: {
      errorMessage: usersMessage.REFRESH_TOKEN_IS_REQUIRED
    },
    custom: {
      options: async (value: string, { req }) => {
        const decodedToken = await verifyRefreshToken({ token: value, secretKey: process.env.JWT_SECRET_REFRESH_TOKEN as string })
        req.decoded_refresh_token = decodedToken
        return true
      }
    }
  }
}, ['body']))

export const emailVerifyTokenValidator = validate(checkSchema({
  email_verify_token: {
    notEmpty: {
      errorMessage: usersMessage.EMAIL_VERIFY_TOKEN_IS_REQUIRED
    },
    custom: {
      options: async (value: string, { req }) => {
        const decodedToken = await emailVerifyToken({ token: value, secretKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string })
        req.decoded_email_verify_token = decodedToken
        return true
      }
    }
  }
}, ['body']))
