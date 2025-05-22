import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody, UpdateMeReqBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'
import { usersMessage } from '~/constants/messages'
config()

// cái service này dùng cho cái collection users, khi nào code cần dùng đến cái collection này thì gọi service ra
class UsersService {
  // truyền vào payload cả trạng thái của người dùng để khỏi gọi lại db để xác nhận xem người dùng này đã xác thực hay chưa
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        algorithm: 'HS256',
        // cái này nó là dạng chuỗi đặc biệt để định dạng Date
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y'}`
      }
    })
  }

  private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        algorithm: 'HS256',
        // cái này nó là dạng chuỗi đặc biệt để định dạng Date
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y'}`
      }
    })
  }

  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        algorithm: 'HS256',
        // cái này nó là dạng chuỗi đặc biệt để định dạng Date
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXIPIRES_IN as `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y'}`
      }
    })
  }

  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        algorithm: 'HS256',
        // cái này nó là dạng chuỗi đặc biệt để định dạng Date
        expiresIn: process.env
          .FORGOT_PASSWORD_TOKEN_EXIPIRES_IN as `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y'}`
      }
    })
  }

  private signAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }

  async checkEmailExit(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }

  async register(payload: RegisterReqBody) {
    // sau khi đăng ký thì thêm vào db và tạo các token gửi về cho người dùng
    const result = await databaseService.users.insertOne(
      new User({ ...payload, date_of_birth: new Date(payload.date_of_birth), password: hashPassword(payload.password) })
    )
    // nên trả về kết quả của việc insert để sau này có thể lấy insertedId dùng cho việc tạo token gì đó (tạm thời chưa biết)
    const user_id = result.insertedId.toString()
    const email_verify_token = await this.signEmailVerifyToken({ user_id, verify: UserVerifyStatus.Unverified })
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refreshToken })
    )

    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          email_verify_token: email_verify_token
        }
      }
    )

    return {
      accessToken,
      refreshToken,
      email_verify_token
    }
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({ user_id, verify })
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refreshToken })
    )
    return {
      accessToken,
      refreshToken
    }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: usersMessage.LOGOUT_SUCCESS
    }
  }

  async verifyEmail(user_id: string) {
    // khi token gửi lên đã khớp với token được lưu trong db thì xác nhận email cho người dùng và thực hiện xóa token
    const result = await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          email_verify_token: '',
          verify: UserVerifyStatus.Verified
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      verify: UserVerifyStatus.Verified
    })
    return {
      access_token,
      refresh_token
    }
  }

  async resendEmailVerify(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    })
    // tạo lại email verify token cho người dùng để gửi lại
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          email_verify_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      email_verify_token
    }
  }
  // sau đó sẽ gửi email cho người dùng với token này (cái gửi email thì chưa làm, nào làm tự hiểu)

  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify })
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          forgot_password_token: forgot_password_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      forgot_password_token
    }

    // sau đó sẽ gửi cái liên kết chứa token này tới email người dùng https://x.com/reset-password?token=abc123xyz
    // tới cái api reset password thì xử lý ở đấy chứ phần này tới đây là xong rồi
  }

  async resetPassword(_id: string, password: string) {
    // sau khi xác thực token thì sẽ cập nhật lại mật khẩu cho người dùng
    const hashedPassword = hashPassword(password)
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(_id)
      },
      {
        $set: {
          password: hashedPassword,
          forgot_password_token: ''
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
  }

  async getUserInfo(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        // k trả về thông tin nhạy cảm của người dùng
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          refresh_token: 0,
          verify: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )
    if (!user) {
      throw new Error(usersMessage.USER_NOT_FOUND)
    }
    return user
  }

  async updateUserInfo(user_id: string, payload: Partial<UpdateMeReqBody>) {
    const updateData: any = {
      ...payload,
      ...(payload.date_of_birth && {
        date_of_birth: new Date(payload.date_of_birth)
      })
    }

    // Xoá date_of_birth nếu không tồn tại để tránh gán null
    if (!payload.date_of_birth) {
      delete updateData.date_of_birth
    }

    const user = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: updateData,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          refresh_token: 0,
          verify: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )
    return user
  }
}

const usersService = new UsersService()
export default usersService
