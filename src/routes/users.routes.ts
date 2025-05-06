import { Router } from 'express'
// ~ đại diện cho src (được cấu hình ở tsconfig.json rồi)
import { loginValidator } from '~/middlewares/users.middlewares'
import { loginController, registerController } from '~/controllers/users.controller'
const usersRouter = Router()

// tách các middleware, controller thành các module riêng cho dễ quản lý
usersRouter.post('/login', loginValidator, loginController)
usersRouter.post('/register', registerController)

export default usersRouter
