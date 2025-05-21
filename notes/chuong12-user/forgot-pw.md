# /forgot-password

1. Người dùng nhấn vào quên mk và send email
2. Gửi lên body: {email: string} qua /forgot-password
3. Server kiểm tra email có tồn tại không và cập nhật forgot-pw-token trong db
4. Server gửi link đến email người dùng kèm token trong link đó để người dùng đặt lại mk
5. Người dùng vào link để đặt lại mk, token được check tại /verify-forgot-password. Nếu token hợp lệ thì cho phép cập nhật mk 
6. Người dùng cập nhật lại mk mới lên server qua /reset-password
7. Server cập nhật lại pw

# /reset-password
6.1. Người dùng gửi lên forgot_pw_token, pw, confirm_pw
6.2. Server validate
6.3. Tiến hành cập nhật pw và xóa forgot_pw_token trong db