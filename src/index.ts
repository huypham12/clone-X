import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import { config } from 'dotenv'
import mediaRouter from './routes/medias.routes'
import staticRouter from './routes/static.routes'
import tweetsRouter from './routes/tweets.routes'
import searchRouter from './routes/search.routes'
import cors from 'cors'

// import fs from 'fs'
// import path from 'path'
// import { YAML } from 'zx'
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'

import { createServer } from 'http'
import { Server } from 'socket.io'
import Conversation from './models/schemas/Conversation.schema'
import conversationRouter from './routes/conversation.routes'

// import faker from '~/utils/faker' // Import và chạy faker script
// // Chạy faker nếu NODE_ENV là development
// if (process.env.NODE_ENV === 'development') {
//   faker().catch((err) => {
//     console.error('Error running faker:', err)
//   })
// }

// import { insertUsers } from './services/test_index'
// insertUsers().catch(console.dir)

import { getEnvConfig, isProduction } from './constants/config'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
getEnvConfig() // Lấy cấu hình từ file .env

const app = express()
app.use(helmet()) // Sử dụng helmet để bảo mật ứng dụng Express
app.use(
  cors({
    origin: isProduction ? 'https://clone-x.onrender.com' : '*', // Cho phép truy cập từ nguồn gốc này
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] // Các phương thức HTTP được phép
  })
) // Sử dụng middleware cors để cho phép những nguồn được phép truy cập vào API

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
})
app.use(limiter) // Sử dụng middleware rateLimit để giới hạn số lượng request từ mỗi IP

// const file = fs.readFileSync(path.join(__dirname, '../swagger-x.yaml'), 'utf8')
// const swaggerDocs = YAML.parse(file)
const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'X API',
      version: '1.0.0'
    }
  },
  apis: ['./swagger-x.yaml'] // files containing annotations as above
}

const openapiSpecification = swaggerJSDoc(options) // Tạo tài liệu OpenAPI từ file swagger-x.yaml
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification)) // Cấu hình Swagger UI để hiển thị tài liệu API

const httpServer = createServer(app)
const port = process.env.PORT
app.use(express.json()) //parse json thành object

databaseService.connect()
// Tạo các index cho các collection trong MongoDB
databaseService.indexUser()
databaseService.indexRefreshToken()
databaseService.indexFollowers()
databaseService.indexTweets()

app.use('/users', usersRouter)
app.use('/medias', mediaRouter)
app.use('/tweets', tweetsRouter)
app.use('/search', searchRouter)
app.use('/conversations', conversationRouter) // sử dụng router cho conversations
app.use('/static', staticRouter) // phục vụ các file tĩnh trong thư mục UPLOAD_IMAGE_DIR
// app.use('/static', express.static(UPLOAD_IMAGE_DIR)) // phục vụ các file tĩnh trong thư mục UPLOAD_IMAGE_DIR

app.use(defaultErrorHandler) // tất cả các lỗi sẽ đi vào đây để xử lý

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000', // Cho phép tất cả các nguồn gốc
    methods: ['GET', 'POST'], // Chỉ cho phép các phương thức GET và POST
    allowedHeaders: ['Content-Type'], // Chỉ cho phép header Content-Type
    credentials: true // Cho phép cookie và thông tin xác thực khác
  }
})

const users: {
  [key: string]: { socket_id: string; access_token: string; name: string }
} = {}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id)
  const user_id = socket.handshake.auth._id
  const name = socket.handshake.auth.name
  const token = socket.handshake.auth.token

  users[user_id] = {
    socket_id: socket.id,
    access_token: token,
    name: name // lưu thêm name
  }

  socket.on('private_message', async (data) => {
    const receiverSocket = users[data.to]
    const senderSocket = users[user_id]

    if (!receiverSocket) {
      console.error('Receiver not found:', data.to)
      return
    }

    // Lưu vào database
    await databaseService.conversations.insertOne(
      new Conversation({
        sender_id: user_id,
        receiver_id: data.to,
        content: data.message,
        created_at: new Date(),
        updated_at: new Date()
      })
    )

    // Gửi cho người nhận
    socket.to(receiverSocket.socket_id).emit('receive private message', {
      message: data.message,
      from_id: user_id,
      from_name: senderSocket.name,
      to_id: data.to,
      to_name: receiverSocket.name,
      timestamp: new Date().toISOString()
    })

    // (Tùy chọn) Gửi phản hồi lại người gửi nếu cần
  })

  socket.on('disconnect', () => {
    // Xóa người dùng khỏi danh sách khi ngắt kết nối
    delete users[user_id]
    console.log('A user disconnected:', socket.id)
  })
})

httpServer.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
