import { Router } from 'express'
import { wrap } from '~/utils/handlers'
import { uploadSingleImageController } from '~/controllers/medias.controller'
const mediaRouter = Router()

mediaRouter.post('/upload-image', wrap(uploadSingleImageController))

export default mediaRouter
