import { Router } from 'express'
import { serveImageController } from '~/controllers/medias.controller'
const staticRouter = Router()

staticRouter.get('/image/:name', serveImageController)

export default staticRouter
