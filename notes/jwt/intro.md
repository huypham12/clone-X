# jwt 
# Hàm mã hóa 
- Hàm jwt.sign(payload, sercetKey, [opitons, callback])
- Payload là thông tin người dùng như user_id, loại token trả về. Có 3 dạng là string | buffer | object. Nên truyền ở dạng object để có thể set thời gian
  - exp (hết hạn)
  - iat (phát hành)
  - nbf (bắt đầu hiệu lực)
Payload sau đó được chuyển sang chuỗi bằng JSON.stringify
- SecretKey: khóa này do server giữ (lưu ở .env) thường là string

- Options: cấu hình loại thuật toán, thời gian, ... (tạm thời hai cái này là ok rồi, còn sau scale thì xem thêm)

# Hàm decode 
- jwt.verify giúp giải mã và xác thực cái token gửi lên xem nó có đúng hay không
- jwt.verify(token, secretOrPublicKey, [options, callback])
- token được người dùng gửi lên để server xác thực
- secretKey: cái này lưu tại server lúc mã hóa, giờ dùng để so khớp
- options: cái này chưa dùng:)))
- callback(err, decoded): trả về lỗi hoặc decoded