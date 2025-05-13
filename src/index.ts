import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { Request, Response, NextFunction } from 'express'

const app = express()
const port = process.env.PORT
app.use(express.json()) //parse json thành object
databaseService.connect()

app.use('/users', usersRouter)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(400).json({ error: err.message })
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
