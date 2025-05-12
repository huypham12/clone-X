import jwt, { SignOptions } from 'jsonwebtoken'

// mấy cái chỗ kiểu dữ liệu này ts nó có cái gọi là function overloads nên phải viết đúng kiểu dữ liệu cụ thể thì mới đc:))) biết thế đã

// cái hàm signToken này nhận vào 3 cái payload (chứa dữ liệu người dùng), secret key và SignOptions dùng để mã hóa thành token. Nó trả về một promise nếu cái hàm sign tạo token thành công thì resolve không thì reject
export const signToken = ({
  payload,
  privateKey = process.env.JWT_SECRET as string,
  options
}: {
  payload: string | Buffer | object
  privateKey?: string
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
