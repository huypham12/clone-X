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
import { ErrorWithStatus } from '~/models/errors'
import httpStatus from '~/constants/httpStatus'
import Followers from '~/models/schemas/Followers.schema'
import axios from 'axios'
import { verify } from 'crypto'
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
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password),
        username: `user${user_id.toString()}`,
        email_verify_token: email_verify_token
      })
    )
    // nên trả về kết quả của việc insert để sau này có thể lấy insertedId dùng cho việc tạo token gì đó (tạm thời chưa biết)

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

  private async getOauthGoogleToken(code: string) {
    // dữ liệu gửi lên để lấy token từ Google, đây là chuẩn của gg cứ theo thôi
    const body = {
      code, // mã này được gửi khi người dùng đồng ý đăng nhập bằng GG bên frontend
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }

    // gửi yêu cầu đến Google để lấy token
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data
  }

  // hàm này dùng để lấy thông tin người dùng từ Google sau khi đã có access_token và id_token
  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data
  }

  async oauth(code: string) {
    const { id_token, access_token } = await this.getOauthGoogleToken(code)
    const userInfo = await this.getGoogleUserInfo(access_token, id_token)
    if (!userInfo.verified_email) {
      throw new ErrorWithStatus({
        message: usersMessage.GMAIL_NOT_VERIFIED,
        status: httpStatus.BAD_REQUEST
      })
    }

    // kiểm tra xem người dùng đã đăng ký chưa, nếu chưa thì tạo mới
    const user = (await databaseService.users.findOne({ email: userInfo.email })) as User

    if (user) {
      const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
        user_id: user._id.toString(),
        verify: user.verify
      })
      await databaseService.refreshTokens.insertOne(new RefreshToken({ user_id: user._id, token: refresh_token }))
      return {
        access_token,
        refresh_token,
        newUser: 0,
        verify: user.verify
      }
    } else {
      const user_id = new ObjectId()
      const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
        user_id: user_id.toString(),
        verify: UserVerifyStatus.Unverified
      })
      const result = await databaseService.users.insertOne(
        new User({
          _id: user_id,
          email: userInfo.email,
          username: `user${user_id.toString()}`,
          password: hashPassword(crypto.randomUUID()),
          avatar: userInfo.picture,
          name: userInfo.name,
          date_of_birth: new Date()
        })
      )
      await databaseService.refreshTokens.insertOne(new RefreshToken({ user_id: user_id, token: refresh_token }))
      return {
        access_token,
        refresh_token,
        newUser: 1,
        verify: UserVerifyStatus.Unverified
      }
    }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: usersMessage.LOGOUT_SUCCESS
    }
  }

  async refreshToken(refresh_token: string, user_id: string, verify: UserVerifyStatus) {
    const [refreshToken, accesToken] = await Promise.all([
      this.signRefreshToken({ user_id, verify }),
      this.signAccessToken({ user_id, verify }),
      databaseService.refreshTokens.deleteOne({ token: refresh_token })
    ])
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refreshToken })
    )

    return { refreshToken, accesToken }
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

    // thêm refresh token vào db
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
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

  async getProfile(username: string) {
    const user = await databaseService.users.findOne(
      { username: username },
      {
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
      throw new ErrorWithStatus({
        message: usersMessage.USER_NOT_FOUND,
        status: httpStatus.NOT_FOUND
      })
    }
    return user
  }

  async follow(user_id: string, followed_user_id: string) {
    await databaseService.followers.insertOne(
      new Followers({
        user_id: new ObjectId(user_id),
        followed_user_id: new ObjectId(followed_user_id)
      })
    )
  }

  async unfollow(user_id: string, followed_user_id: string) {
    await databaseService.followers.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
  }

  async changePassword(user_id: string, password: string) {
    const hashedPassword = hashPassword(password)
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hashedPassword
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
  }
}

const usersService = new UsersService()
export default usersService
