// định nghĩa kiểu cho giá trị mà Request gửi đến
// cái ts này chỉ kiểm tra lúc viết mã nên là chủ yếu là bắt lỗi giúp mình là chính

import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enums'

export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface LoginReqBody {
  email: string
  password: string
}

export interface VerifyEmailReqBody {
  email_verify_token: string
}

export interface LogoutReqBody {
  refresh_token: string
}

export interface RefreshTokenReqBody {
  refresh_token: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  verify: UserVerifyStatus
  iat: number
  exp: number
}

export interface ForgotPasswordReqBody {
  email: string
}

export interface VerifyForgotPasswordReqBody {
  forgot_password_token: string
}

export interface ResetPasswordReqBody {
  password: string
  confirm_password: string
}

export interface UpdateMeReqBody {
  name?: string
  bio?: string
  date_of_birth?: string
  website?: string
  username?: string
  avatar?: string
  covver_photo?: string
  location?: string
}
