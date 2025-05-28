import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { Request, Response, NextFunction } from 'express'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import { config } from 'dotenv'
import mediaRouter from './routes/medias.routes'
import { UPLOAD_IMAGE_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
config()

const app = express()
const port = process.env.PORT
app.use(express.json()) //parse json thành object
databaseService.connect()
app.use('/static', staticRouter) // phục vụ các file tĩnh trong thư mục UPLOAD_IMAGE_DIR
// app.use('/static', express.static(UPLOAD_IMAGE_DIR)) // phục vụ các file tĩnh trong thư mục UPLOAD_IMAGE_DIR

app.use('/users', usersRouter)
app.use('/medias', mediaRouter)
// tất cả các lỗi sẽ đi vào đây để xử lý
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
