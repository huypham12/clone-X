import jwt, { SignOptions } from 'jsonwebtoken'
import { config } from 'dotenv'
import { TokenPayload } from '~/models/requests/User.requests'
config()

// mấy cái chỗ kiểu dữ liệu này ts nó có cái gọi là function overloads nên phải viết đúng kiểu dữ liệu cụ thể thì mới đc:))) biết thế đã

// cái hàm signToken này nhận vào 3 cái payload (chứa dữ liệu người dùng), secret key và SignOptions dùng để mã hóa thành token. Nó trả về một promise nếu cái hàm sign tạo token thành công thì resolve không thì reject
export const signToken = ({
  payload,
  privateKey,
  options
}: {
  payload: string | Buffer | object
  privateKey: string
  options: SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) {
        return reject(error)
      }
      return resolve(token as string)
    })
  })
}

// hàm này giúp giải mã + xác thực, nếu token gửi lên đúng thì nó trả về cái code đã được giải mã
export const verifyToken = ({ token, secretKey }: { token: string; secretKey: string }) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretKey, (error, decoded) => {
      if (error) {
        return reject(error)
      }
      resolve(decoded as TokenPayload)
    })
  })
}
