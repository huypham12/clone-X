import { Request } from 'express'
import User from './models/schemas/User.schema'
import { ForgotPasswordReqBody, TokenPayload } from './models/requests/User.requests'
import Tweet from './models/schemas/Tweet.schema'

declare module 'express' {
  interface Request {
    user?: User
    decoded_email_verify_token?: TokenPayload
    decoded_authorization?: TokenPayload
    decoded_forgot_password_token?: TokenPayload
    decoded_refresh_token?: TokenPayload
    tweet?: Tweet
  }
}
