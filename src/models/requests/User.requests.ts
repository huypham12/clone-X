// định nghĩa kiểu cho giá trị mà Request gửi đến
// cái ts này chỉ kiểm tra lúc viết mã nên là chủ yếu là bắt lỗi giúp mình là chính

export default interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}
