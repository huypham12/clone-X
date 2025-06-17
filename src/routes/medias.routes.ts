import { Router } from 'express'
import { wrap } from '~/utils/handlers'
import { uploadImageController, uploadVideoController, uploadVideoHLSController } from '~/controllers/medias.controller'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
const mediaRouter = Router()

mediaRouter.post('/upload-image', accessTokenValidator, verifiedUserValidator, wrap(uploadImageController))

mediaRouter.post('/upload-video', accessTokenValidator, verifiedUserValidator, wrap(uploadVideoController))

mediaRouter.post('/upload-video-hls', accessTokenValidator, verifiedUserValidator, wrap(uploadVideoHLSController))

export default mediaRouter
