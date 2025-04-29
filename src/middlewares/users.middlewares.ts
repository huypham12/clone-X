import { Request, Response, NextFunction } from 'express'

// middleware này trả về lỗi khi thiếu email, mật khẩu
export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).json({
      error: 'Missing email or password'
    })
    return

    // return  res.status(400).json({
    //   error: 'Missing email or password'
    // })
    // ghi như này là sai vì express tới ts mong muốn trả về void hoặc promise<void> (nghĩa là k trả về gì) chứ không phải một response
  }
  // chuyển qua middleware hoặc controller tiếp theo
  next()
}
