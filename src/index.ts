import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'

const app = express()
const port = process.env.PORT
app.use(express.json())
databaseService.connect()

app.use('/users', usersRouter)

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
