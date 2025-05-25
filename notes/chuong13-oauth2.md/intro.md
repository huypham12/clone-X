# OAuth2 (Open Authorization)

- Giao thức ủy quyền cho phép ứng dụng sử dụng tài khoản từ các dịch vụ gg, fb, ...

# Flow

1. Người dùng truy cập vào trang login x.com/login
2. Web chuyển hướng người dùng đến https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fapi%2Foauth%2Fgoogle&client_id=480331042606-gm573du1155724l8f780em2fel1a5dd3.apps.googleusercontent.com&access_type=offline&response_type=code&prompt=consent&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&service=lso&o2v=2&flowName=GeneralOAuthFlow
3. Người dùng chọn tài khoản để đăng nhập và gg sẽ trả về một cái link chưa các code được tự sinh
4. Server nhận được code và tiến hành gọi lên API để lấy id-token và access-token, sau đó lại lấy thông tin người dùng từ cái token này
5. Có email rồi thì kiểm tra xem đã đki chưa rồi thì trả về access và refresh token, nếu chưa thì sẽ thêm user vào db và random mật khẩu cho user
6. Tạo access-token và refresh-token
7. Trả về token
8. Fe lưu token này vào cookie để người dùng dùng sau này
