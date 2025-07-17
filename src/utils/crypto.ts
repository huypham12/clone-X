import { createHash } from 'crypto'
import { config } from 'dotenv'
import { getEnvConfig } from '~/constants/config'
getEnvConfig() // Lấy cấu hình từ file .env

export function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

export function hashPassword(password: string) {
  return sha256(password + process.env.PASSWORD_SECRET)
}
