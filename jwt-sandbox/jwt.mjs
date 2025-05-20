// test jwt
import jwt from 'jsonwebtoken'
import { config } from 'dotenv'

const payload = {
  user_id: '123456',
  tokenType: 'access'
}
const secret = 'Hi@#'

const sigToken = async (payload, secret, options) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) {
        reject(err)
      } else {
        resolve(token)
      }
    })
  })
}

const verifyToken = async (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        reject(err)
      } else {
        resolve(decoded)
      }
    })
  })
}
const main = async () => {
  config()
  const options = {
    algorithm: 'HS256',
    expiresIn: '10m'
  }
  const token = await sigToken(payload, secret, options)
  console.log('token', token)
  const decoded = await verifyToken(token, secret)
  console.log('decoded', decoded)
}

main()
  .then(() => {
    console.log('done')
  })
  .catch((err) => {
    console.error('error', err)
  })
  .finally(() => {
    console.log('finally')
  })
