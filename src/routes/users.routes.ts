import { Router } from 'express'
// ~ đại diện cho src (được cấu hình ở tsconfig.json rồi)
import { accessTokenValidator, loginValidator, refreshTokenValidator, registerValidator } from '~/middlewares/users.middlewares'
import { loginController, logoutController, registerController } from '~/controllers/users.controller'
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

export default usersRouter
