import { Router } from 'express'
// ~ đại diện cho src (được cấu hình ở tsconfig.json rồi)
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import {
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  verifyEmailController
} from '~/controllers/users.controller'
import { wrap } from '~/utils/handlers'
const usersRouter = Router()

/*
  Desc: Register a new user
  Path: /register
  Method: Post
  Body: {name: string, email: string, password: string, comfirm_password: string, day_of_birth: ISO8601}

*/
usersRouter.post('/register', registerValidator, wrap(registerController))

// tách các middleware, controller thành các module riêng cho dễ quản lý
usersRouter.post('/login', loginValidator, wrap(loginController))

/*
  Desc: Logout a user
  Path: /logout
  Method: Post
  Header: {Authorization: Bearer <access_token>}
  Body: {refresh_token: string}
  // Bearer là mã thông báo bảo mật dùng trong các giao thức xác thực
*/
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrap(logoutController))

/*
  Description: Refresh token
  Path: /refresh-token
  Method: POST
  Body: {refresh_token: string}
*/
usersRouter.post('/refresh-token', refreshTokenValidator)

/*
  Description: Verify email when user click on the link in email
  Path: /verify-email
  Method: POST
  Body: {email_verify_token: string}
*/
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrap(verifyEmailController))

/*
  Description: Resend verify email when user click on the link in email
  Headers: {Authorization: Bearer <access_token>}
  Method: POST
  Body: {}
*/
usersRouter.post('/resend-verify-email', accessTokenValidator, wrap(resendEmailVerifyController))

export default usersRouter
