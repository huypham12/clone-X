# forgot-password

1. Người dùng nhấn vào quên mk và send email
2. Gửi lên body: {email: string} qua /forgot-password
3. Server kiểm tra email có tồn tại không và cập nhật forgot-pw-token trong db
4. Server gửi link đến email người dùng kèm token trong link đó để người dùng đặt lại mk
5. Người dùng vào link để đặt lại mk, nếu token hợp lệ thì cho phép cập nhật mk /verify-forgot-password
6. Người dùng cập nhật lại mk mới lên server qua /reset-password
7. Server cập nhật lại pw
