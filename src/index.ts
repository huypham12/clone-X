import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import { config } from 'dotenv'
import mediaRouter from './routes/medias.routes'
import staticRouter from './routes/static.routes'
import tweetsRouter from './routes/tweets.routes'
// import '~/utils/faker' // import để chạy hàm tạo dữ liệu giả, không cần sử dụng trực tiếp
config()
// import { insertUsers } from './services/test_index'
// insertUsers().catch(console.dir)

const app = express()
const port = process.env.PORT
app.use(express.json()) //parse json thành object
databaseService.connect()
databaseService.indexUser() // tạo index cho các collection trong database
databaseService.indexRefreshToken()
databaseService.indexFollowers()

app.use('/users', usersRouter)
app.use('/medias', mediaRouter)
app.use('/tweets', tweetsRouter)
app.use('/static', staticRouter) // phục vụ các file tĩnh trong thư mục UPLOAD_IMAGE_DIR
// app.use('/static', express.static(UPLOAD_IMAGE_DIR)) // phục vụ các file tĩnh trong thư mục UPLOAD_IMAGE_DIR

// tất cả các lỗi sẽ đi vào đây để xử lý
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
