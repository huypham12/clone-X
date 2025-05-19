# Luồng /resend-verify-email

# Người dùng
1. Người dùng đã đăng ký thành công và được server trả về access token và refresh token và email-verify-token
2. Khi người dùng muốn gửi lại token để xác nhận email thì 
3. Người dùng sẽ gửi lên access-token để yêu cầu resend-verify-email (việc cho đăng nhập xong mới gửi email xác thực giúp tránh spam)

# Server
1. Validate cái access-token nếu đúng thì cho đi tiếp
2. Decode cái token để lấy user_id, kiểm tra xem có user này k, đã xác thực hay chưa, nếu chưa thì 
3. Tạo mới một verify-email-token và cập nhật vào db, sau đó gửi lại link mới (cái này chưa làm) kèm cái token vừa tạo