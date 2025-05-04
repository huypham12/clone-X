import User from '~/models/schemas/User.schema'
import databaseService from './database.services'

// cái service này dùng cho cái collection users, khi nào code cần dùng đến cái collection này thì gọi service ra
class UsersService {
  async register(payload: { email: string; password: string }) {
    const { email, password } = payload
    const result = await databaseService.users.insertOne(new User({ email, password })) // nên trả về kết quả của việc insert để sau này có thể lấy insertedId dùng cho việc tạo token gì đó (tạm thời chưa biết)
    return result
  }
}

const usersService = new UsersService()
export default usersService
