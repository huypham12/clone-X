import { Router } from 'express'
import { serveImageController, serveVideoStreamController } from '~/controllers/medias.controller'
const staticRouter = Router()

staticRouter.get('/image/:name', serveImageController)
staticRouter.get('/video-stream/:name', serveVideoStreamController)

export default staticRouter
