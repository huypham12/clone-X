import { Router } from 'express'
// ~ đại diện cho src (được cấu hình ở tsconfig.json rồi)
import { loginValidator, registorValidator } from '~/middlewares/users.middlewares'
import { loginController, registerController } from '~/controllers/users.controller'
const usersRouter = Router()

// tách các middleware, controller thành các module riêng cho dễ quản lý
usersRouter.post('/login', loginValidator, loginController)

/*
  Desc: Register a new user
  Path: /register
  Method: Post
  Body: {name: string, email: string, password: string, comfirm_password: string, day_of_birth: ISO8601}

*/
usersRouter.post('/register', registorValidator, registerController)

export default usersRouter
