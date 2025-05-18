 # Auth
 - Hiện tại là có hai route: users/register và users/login 
 - Trước khi các req tới được các controller tương ứng chúng phải đi qua các middleware
 ```ts
 - middleware tổng
 app.use(express.json()) //parse json thành object 
 app.use(defaultErrorHandler) // gom tất cả các lỗi vào đây để xử lý theo format chung
 // Error cũng được chuẩn hóa với các class riêng

 // Những phần dữ liệu mà chưa có kiểu rõ ràng sẽ được định nghĩa thông qua class hoặc interface (cái này làm tới đâu fix tới đấy)
 // Các biến liên quan đến vấn đề bảo mật sẽ được đẩy vào env
 // Các hằng như status, message được dùng nhiều nơi sẽ đưa vào constant

 - User middleware
 // Chủ yếu sử dụng thư viện express-validator để xử lý các vấn đề liên quan đến format đầu vào cho req
 loginValidator
 registerValidator

 // Thư mục utils
 // Mật khẩu sử dụng hashpassword của crypto có sẵn trong nodejs (crypto.ts )
 // Access token và refresh token sử dụng jsonwebtoken (jwt.ts)
 // Hàm validate giúp xử lý các lỗi từ validation chain (lấy từ checkSchema)
 // Wrap bọc lại các hàm async tránh phải try catch nhiều lần (handler.ts)
 // Các hàm tiện ích này sẽ được sử dụng trong các middleware hoặc controller 


// Services
// database services: kết nối db và trả về các collection để tương tác
// user service: xử lý các vấn đề liên quan đến user như tạo token, đăng ký, đăng nhập đều ở đây, middleware và controller chỉ cần gọi để sử dụng 
 ```
