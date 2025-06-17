import { Router } from 'express'
import { serveImageController, serveVideoStreamController, serveHLSController } from '~/controllers/medias.controller'
const staticRouter = Router()

staticRouter.get('/image/:name', serveImageController)
staticRouter.get('/video-stream/:name', serveVideoStreamController)
// Route for HLS master playlist
staticRouter.get('/video-stream/:name/master.m3u8', serveHLSController)
// Route for HLS variant playlists and segments
staticRouter.get('/video-stream/:name/v:variant/:file', serveHLSController)

export default staticRouter
