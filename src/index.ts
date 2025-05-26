import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { Request, Response, NextFunction } from 'express'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import { config } from 'dotenv'
import mediaRouter from './routes/medias.routes'
config()

const app = express()
const port = process.env.PORT
app.use(express.json()) //parse json thành object
databaseService.connect()

app.use('/users', usersRouter)
app.use('/medias', mediaRouter)
// tất cả các lỗi sẽ đi vào đây để xử lý
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
