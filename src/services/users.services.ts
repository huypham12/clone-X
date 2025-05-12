import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import RegisterReqBody from '~/models/requests/User.requests'

// cái service này dùng cho cái collection users, khi nào code cần dùng đến cái collection này thì gọi service ra
class UsersService {
  async register(payload: RegisterReqBody) {
    const { email, password } = payload
    const result = await databaseService.users.insertOne(new User({ ...payload, date_of_birth: new Date() }))
    // nên trả về kết quả của việc insert để sau này có thể lấy insertedId dùng cho việc tạo token gì đó (tạm thời chưa biết)
    return result
  }

  async checkEmailExit(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }
}

const usersService = new UsersService()
export default usersService
