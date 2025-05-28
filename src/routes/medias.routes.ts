import { Router } from 'express'
import { wrap } from '~/utils/handlers'
import { uploadImageController } from '~/controllers/medias.controller'
const mediaRouter = Router()

mediaRouter.post('/upload-image', wrap(uploadImageController))

export default mediaRouter
