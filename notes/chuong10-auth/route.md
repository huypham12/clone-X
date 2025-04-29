```ts
/*
  - Route là cái tuyến đường để liên lạc giữa client và server, thông qua giao thức http với các method như get, put, patch, delete, ...

  - Express là một framework, với Express.Router() giúp hỗ trợ nhóm các route có liên quan lại với nhau, giúp tổ chức code tốt hơn. Ví dụ với route user m có các route con là user/info, user/:id, ... thì nhóm chung lại nó dễ quản lý hơn

  - Middleware là hàm trung gian để xử lý các req, res, sau khi xử lý sẽ next() sang cái tiếp theo.

  - Sau khi tập hợp các tuyến đường (router) được định nghĩa xong. Nó cần phải được app (chương trình chính chạy server) sử dụng thông qua app.use()

  - LUỒNG XỬ LÝ CỦA ROUTE
    Khi client gửi một request, nó sẽ được tiếp nhận bởi ứng dụng Express thông qua các middleware toàn cục (được cấu hình với app.use()). Ví dụ như mấy cái express.json để parse chuỗi JSON thành object trước khi gán vào req.body

    - Sau đó request sẽ đc chuyển tiếp đến route handler (là cái router), trong router này có thể có nhiều middleware, request sẽ đi lần lượt qua chúng theo thứ tự của next() để kiểm tra hoặc validate dữ liệu. Nếu một middleware phát hiện lỗi nó sẽ trả về lỗi cho client hoặc đến cái phần xử lý lỗi (chưa học)
    
    - Nếu các request vượt qua được hết các middleware chúng sẽ đến controller để xử lý logic thông qua việc tương tác với service và model. Sau đó controller sẽ response lại cho client. Trong quá trình trên, mỗi lần đi qua next() nếu có lỗi thì cần phải response lỗi luôn cho client, và yêu cầu request lại
*/

import express from 'express'
const app = express()
const router = express.Router()

// middleware
router.use((req, res, next) => {
  console.log('toàn bộ những route của router này sẽ phải đi qua đây')
  next()
})

router.get('/', (req, res) => {
  res.send('Hello World!')
})
router.get('/tweets', (req, res) => {
  res.json({ id: 1, text: 'hello world' })
})

// những request đi qua '/' thì sẽ được cái router này xử lý
app.use('/', router)

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})
```
