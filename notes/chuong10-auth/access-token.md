https://datatracker.ietf.org/doc/html/rfc9068

- code đã rồi đọc hiểu sau

- Luồng đăng ký
  Client gửi email, pw --> middleware kiểm tra định dạng, email đã tồn tại hay chưa --> Tiến hành thêm và db với pw đã được hash --> Gửi email xác thực --> tạo access token và refresh token --> trả token về cho người dùng 
  Dùng express varidator

- Luồng login
