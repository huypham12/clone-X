import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import { config } from 'dotenv'
import mediaRouter from './routes/medias.routes'
import staticRouter from './routes/static.routes'
import tweetsRouter from './routes/tweets.routes'
import searchRouter from './routes/search.routes'
import { da } from '@faker-js/faker'
// Import và chạy faker script
// import faker from '~/utils/faker'
// // Chạy faker nếu NODE_ENV là development
// if (process.env.NODE_ENV === 'development') {
//   faker().catch((err) => {
//     console.error('Error running faker:', err)
//   })
// }
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
databaseService.indexTweets()

app.use('/users', usersRouter)
app.use('/medias', mediaRouter)
app.use('/tweets', tweetsRouter)
app.use('/search', searchRouter)
app.use('/static', staticRouter) // phục vụ các file tĩnh trong thư mục UPLOAD_IMAGE_DIR
// app.use('/static', express.static(UPLOAD_IMAGE_DIR)) // phục vụ các file tĩnh trong thư mục UPLOAD_IMAGE_DIR

// tất cả các lỗi sẽ đi vào đây để xử lý
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
