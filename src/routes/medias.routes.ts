import { Router } from 'express'
import { wrap } from '~/utils/handlers'
import { uploadImageController, uploadVideoController } from '~/controllers/medias.controller'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
const mediaRouter = Router()

mediaRouter.post('/upload-image', accessTokenValidator, verifiedUserValidator, wrap(uploadImageController))

mediaRouter.post('/upload-video', accessTokenValidator, verifiedUserValidator, wrap(uploadVideoController))

export default mediaRouter
