import { Request, Response, NextFunction } from 'express'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import RegisterReqBody, { LogoutReqBody } from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import { usersMessage } from '~/constants/messages'
import databaseService from '~/services/database.services'
import httpStatus from '~/constants/httpStatus'

export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user._id.toString()
  const result = await usersService.login(user_id)
  res.json({
    message: usersMessage.LOGIN_SUCCESS,
    result
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  // khi gọi một hàm bất động bộ thì cần await để chờ nó thực thi xong, vì nếu không chờ nó chỉ là một promise (lời hứa e trao=)))) chứ chưa có gì cả
  const result = await usersService.register(req.body)
  res.status(200).json({
    message: usersMessage.REGISTER_SUCCESS,
    result: result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token} = req.body
  await usersService.logout(refresh_token)
  res.json({
    message: usersMessage.LOGOUT_SUCCESS
  })
 }

