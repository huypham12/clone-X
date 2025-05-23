import e, { Request, Response, NextFunction } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import usersService from '~/services/users.services'
import { ErrorWithStatus } from '~/models/errors'
import { usersMessage } from '~/constants/messages'
import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import httpStatus from '~/constants/httpStatus'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import User from '~/models/schemas/User.schema'
import { error } from 'console'
import { TokenPayload } from '~/models/requests/User.requests'
import { TokenExpiredError } from 'jsonwebtoken'
import { REGEX_USERNAME } from '~/constants/regex'

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
    return await verifyToken({
      token,
      secretKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
  } catch (error: any) {
    if (error instanceof TokenExpiredError) {
      throw new ErrorWithStatus({
        message: usersMessage.TOKEN_EXPIRED, // Bạn cần thêm message này trong `usersMessage`
        status: httpStatus.UNAUTHORIZED
      })
    }

    throw new ErrorWithStatus({
      message: usersMessage.UNAUTHORIZED,
      status: httpStatus.UNAUTHORIZED
    })
  }
}

// Helper function to verify refresh token
const verifyRefreshToken = async ({ token, secretKey }: { token: string; secretKey: string }) => {
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
const emailVerifyToken = async ({ token, secretKey }: { token: string; secretKey: string }) => {
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

// Helper function to verify forgot password token
const verifyForgotPasswordToken = async ({ token, secretKey }: { token: string; secretKey: string }) => {
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

const passwordSchema: ParamSchema = {
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
}

const confirmPasswordSchema: ParamSchema = {
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
}

const forgotPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: usersMessage.FORGOT_PASSWORD_TOKEN_IS_REQUIRED
  },
  custom: {
    options: async (value: string, { req }) => {
      const decodedToken = await verifyForgotPasswordToken({
        token: value,
        secretKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
      })

      const user = await databaseService.users.findOne({ _id: new ObjectId(decodedToken.user_id) })
      if (!user) {
        throw new ErrorWithStatus({
          message: usersMessage.USER_NOT_FOUND,
          status: httpStatus.NOT_FOUND
        })
      }
      // kiểm trả xem token này có đúng với forgot password token trong database không
      if (value !== user.forgot_password_token) {
        throw new ErrorWithStatus({
          message: usersMessage.INVALID_FORGOT_PASSWORD_TOKEN,
          status: httpStatus.UNAUTHORIZED
        })
      }

      req.decoded_forgot_password_token = decodedToken
      return true
    }
  }
}
// lên trang https://github.com/validatorjs/validator.js để đọc mấy cái hàm
export const registerValidator = validate(
  // hàm checkSchema được truyền vào cái hàm validate để đọc cái chuỗi lỗi (vì check schema là kiểu viết khác của validation chain thôi), hàm validate này trả về một hàm async chờ xử lý lỗi nếu pass thì tới request handler không thì tới errors handler tổng
  checkSchema(
    {
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

      password: passwordSchema,

      confirm_password: confirmPasswordSchema,

      date_of_birth: {
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: usersMessage.DATE_OF_BIRTH_MUST_BE_ISO8601
        }
      }
    },
    ['body']
  )
)

// kiểm tra ở vị trí nào thì truyền vào vị trí đó thôi, đỡ phải kiểm tra hết, tăng hiệu xuất
// jwt là self-contained, mình chỉ cần decode nó trong đấy nó chứa hết thông tin xác thực rồi nếu đúng thì được đi tiếp
export const accessTokenValidator = validate(
  checkSchema(
    {
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
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: {
          errorMessage: usersMessage.REFRESH_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            const decodedToken = await verifyRefreshToken({
              token: value,
              secretKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
            })
            req.decoded_refresh_token = decodedToken
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        notEmpty: {
          errorMessage: usersMessage.EMAIL_VERIFY_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            const decodedToken = await emailVerifyToken({
              token: value,
              secretKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
            })
            req.decoded_email_verify_token = decodedToken
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: usersMessage.EMAIL_MUST_BE_VALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({ email: value })
            if (!user) {
              throw new ErrorWithStatus({
                message: usersMessage.EMAIL_DOES_NOT_EXIST,
                status: 409
              })
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordSchema
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      forgot_password_token: forgotPasswordSchema
    },
    ['body']
  )
)

// kiểm tra xem người dùng đã xác thực hay chưa
export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload
  if (verify !== UserVerifyStatus.Verified) {
    next(
      new ErrorWithStatus({
        message: usersMessage.USER_NOT_VERIFIED,
        status: httpStatus.FORBIDDEN
      })
    )
    return
  }
  next()
}

export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        trim: true,
        isString: {
          errorMessage: usersMessage.NAME_MUST_BE_STRING,
          bail: true
        },
        isLength: {
          options: { min: 1, max: 100 },
          errorMessage: usersMessage.NAME_LENGTH_MUST_BE_FROM_1_TO_100
        }
      },

      date_of_birth: {
        optional: true,
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: usersMessage.DATE_OF_BIRTH_MUST_BE_ISO8601
        }
      },

      bio: {
        optional: true,
        trim: true,
        isString: {
          errorMessage: usersMessage.BIO_MUST_BE_STRING,
          bail: true
        },
        isLength: {
          options: { min: 1, max: 1000 }, // hoặc chỉnh max về 500
          errorMessage: usersMessage.BIO_LENGTH_MUST_BE_FROM_1_TO_1000
        }
      },

      website: {
        optional: true,
        trim: true,
        isURL: {
          errorMessage: usersMessage.WEBSITE_MUST_BE_URL
        }
      },

      username: {
        optional: true,
        trim: true,
        isString: {
          errorMessage: usersMessage.USERNAME_MUST_BE_STRING,
          bail: true
        },
        isLength: {
          options: { min: 1, max: 100 },
          errorMessage: usersMessage.USERNAME_LENGTH_MUST_BE_FROM_1_TO_100
        },
        custom: {
          options: async (value, { req }) => {
            if (REGEX_USERNAME && !REGEX_USERNAME.test(value)) {
              throw new ErrorWithStatus({
                message: usersMessage.USERNAME_MUST_BE_ALPHANUMERIC,
                status: 400
              })
            }
            const existing = await databaseService.users.findOne({ username: value })
            // chỉ lỗi nếu có user khác đang dùng username này
            if (existing) {
              throw new ErrorWithStatus({
                message: usersMessage.USERNAME_ALREADY_EXISTS,
                status: 409
              })
            }
            return true
          }
        }
      },

      avatar: {
        optional: true,
        trim: true,
        isURL: {
          errorMessage: usersMessage.AVATAR_MUST_BE_URL
        }
      },

      cover_photo: {
        optional: true,
        trim: true,
        isURL: {
          errorMessage: usersMessage.COVER_PHOTO_MUST_BE_URL
        }
      },

      location: {
        optional: true,
        trim: true,
        isString: {
          errorMessage: usersMessage.LOCATION_MUST_BE_STRING,
          bail: true
        },
        isLength: {
          options: { min: 1, max: 100 },
          errorMessage: usersMessage.LOCATION_LENGTH_MUST_BE_FROM_1_TO_100
        }
      }
    },
    ['body']
  )
)

export const followSomeoneValidator = validate(
  checkSchema(
    {
      followed_user_id: {
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: usersMessage.INVALID_FOLLOWED_USER_ID,
                status: httpStatus.BAD_REQUEST
              })
            }

            const followedUser = await databaseService.users.findOne({ _id: new ObjectId(value) })
            if (!followedUser) {
              throw new ErrorWithStatus({
                message: usersMessage.USER_NOT_FOUND,
                status: httpStatus.NOT_FOUND
              })
            }
          }
        }
      }
    },
    ['body']
  )
)

export const unfollowSomeoneValidator = validate(
  checkSchema(
    {
      followed_user_id: {
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: usersMessage.INVALID_USER_ID,
                status: httpStatus.BAD_REQUEST
              })
            }

            const followedUser = await databaseService.users.findOne({ _id: new ObjectId(value) })
            if (!followedUser) {
              throw new ErrorWithStatus({
                message: usersMessage.USER_NOT_FOUND,
                status: httpStatus.NOT_FOUND
              })
            }
          }
        }
      }
    },
    ['params']
  )
)

export const changePasswordValidator = validate(
  checkSchema(
    {
      old_password: {
        notEmpty: {
          errorMessage: usersMessage.OLD_PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: usersMessage.OLD_PASSWORD_MUST_BE_STRING
        },
        custom: {
          options: async (value, { req }) => {
            const access_token = req.decoded_authorization as TokenPayload
            console.log('access_token', access_token)
            const user = (await databaseService.users.findOne({ _id: new ObjectId(access_token.user_id) })) as User
            if (!user) {
              throw new ErrorWithStatus({
                message: usersMessage.USER_NOT_FOUND,
                status: httpStatus.NOT_FOUND
              })
            }
            if (user.password !== hashPassword(value)) {
              throw new ErrorWithStatus({
                message: usersMessage.OLD_PASSWORD_IS_INCORRECT,
                status: httpStatus.UNAUTHORIZED
              })
            }
            return true
          }
        }
      },

      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
)
