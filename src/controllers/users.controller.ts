import { Request, Response } from 'express'
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
