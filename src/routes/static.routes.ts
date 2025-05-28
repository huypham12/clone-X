import { Router } from 'express'
import { stat } from 'fs'
import { serveImageController, serveVideoController } from '~/controllers/medias.controller'
const staticRouter = Router()

staticRouter.get('/image/:name', serveImageController)
staticRouter.get('/video/:name', serveVideoController)

export default staticRouter
