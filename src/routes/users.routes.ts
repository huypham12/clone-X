import { Router } from 'express'
// ~ đại diện cho src (được cấu hình ở tsconfig.json rồi)
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import {
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controller'
import { wrap } from '~/utils/handlers'
import { filterMiddlewares } from '~/middlewares/common.middlewares'
const usersRouter = Router()

/*
  Desc: Register a new user
  Path: /register
  Method: Post
  Body: {name: string, email: string, password: string, comfirm_password: string, date_of_birth: ISO8601}

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

/*
  Description: Forgot password
  Path: /forgot-password
  Method: POST
  Body: {email: string}
  // Gửi email để đặt lại mật khẩu
*/
usersRouter.post('/forgot-password', forgotPasswordValidator, wrap(forgotPasswordController))

/*
  Description: Verify link in email to reset password
  Path: /verify-forgot-password
  Method: POST
  Body: {forgot_password_token: string}
  // khi người dùng bấm vào link trong email thì sẽ gửi về token để xác thực
  // sau đó sẽ gửi về một form để người dùng nhập mật khẩu mới và xác nhận mật khẩu mới (cái phần này thuộc reset password)

  */
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrap(verifyForgotPasswordTokenController)
)

/*
  Description: Reset password
  Path: /reset-password
  Method: POST
  Body: {password: string, confirm_password: string, forgot_password_token: string}
*/
usersRouter.post('/reset-password', resetPasswordValidator, wrap(resetPasswordController))

/*
  Description: Get user info
  Path: /me
  Method: GET
  Header: {Authorization: Bearer <access_token>}
  lấy thông tin người dùng
*/
usersRouter.get('/me', accessTokenValidator, wrap(getMeController))

/*
  Description: Update user info
  Path: /me
  Method: PATCH
  Header: {Authorization: Bearer <access_token>}
  Body: {userInfo: object}
  lấy thông tin người dùng
*/
usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddlewares(['name', 'bio', 'date_of_birth', 'website', 'username', 'avatar', 'cover_photo', 'location']),
  wrap(updateMeController)
)

/*
  Description: Get user profile
  Path: /:username
  Method: get
  Header: 
  Body: {userInfo: object}
  lấy thông tin người dùng
*/
usersRouter.get('/:username', wrap(getProfileController))

export default usersRouter
