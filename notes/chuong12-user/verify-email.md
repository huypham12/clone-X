# Luồng xác thực email
1. Khi người dùng đăng ký thành công thì sẽ tạo mới người dùng trong db và email_verify_token được lưu cùng.
2. Trả về cho người dùng cái email_verify_token (hoặc thêm access token và refresh token, t nghĩ là k cần thiết nhưng có thể có cập nhật sau biết vậy đã)
3. Gửi email xác nhận (cái này chưa làm) người dùng click link để gửi cái verify token lên server
4. Server thực hiện kiểm tra định dạng và decode để lấy user_id cập nhật lại cái verify thành đã xác thực và xóa cái email_verify_token trong db
5. Sau khi cập nhật thành công thì trả về cho người dùng access token và refresh token để người dùng có thể đăng nhập
6. Việc đăng nhập là do fe xử lý khi lấy được token 