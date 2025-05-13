import { Request, Response, NextFunction } from 'express'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import RegisterReqBody from '~/models/requests/User.requests'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'huy@gmail.com' && password === '1234') {
    res.status(200).json({
      message: 'Login success'
    })
  } else {
    res.status(400).json({
      message: 'Incorrect login information'
    })
  }
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  // khi gọi một hàm bất động bộ thì cần await để chờ nó thực thi xong, vì nếu không chờ nó chỉ là một promise (lời hứa e trao=)))) chứ chưa có gì cả
  const result = await usersService.register(req.body)
  res.status(200).json({
    message: 'Register Success',
    result: result
  })
}
