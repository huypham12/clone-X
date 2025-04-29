import express from 'express'
import usersRouter from './routes/users.routes'

const app = express()
const port = 3000
app.use(express.json())

app.use('/users', usersRouter)

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

// Huy
// GdZadvA33iF9@sC
