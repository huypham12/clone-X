import { IncomingMessage } from 'http'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { handleUploadImage, handleUploadVideo } from '~/utils/file'
import fs from 'fs'
import { config } from 'dotenv'
import { isProduction } from '~/constants/config'
import { MediaType } from '~/constants/enums'
config()
import { Media } from '~/models/Orther'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'

class MediasService {
  async uploadImage(req: IncomingMessage) {
    const files = await handleUploadImage(req) // File from formidable or similar
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const oldPath = file.newFilename // full path of uploaded file
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${oldPath.replace(/\.\w+$/, '.jpeg')}`)
        const info = await sharp(file.filepath).jpeg().toFile(newPath)
        fs.unlinkSync(file.filepath) // xóa file tạm thời sau khi chuyển đổi
        // nếu là môi trường production thì trả về đường dẫn đầy đủ
        // nếu là môi trường development thì trả về đường dẫn localhost
        return {
          url: isProduction
            ? `${process.env.HOST}/static/${path.basename(newPath)}`
            : `http://localhost:${process.env.PORT}/static/image/${path.basename(newPath)}`,
          type: MediaType.Image
        }
      })
    )
    return result
  }

  async uploadVideo(req: IncomingMessage) {
    const files = await handleUploadVideo(req) // File from formidable or similar
    const result = files.map((file) => {
      return {
        url: isProduction
          ? `${process.env.HOST}/static/video-stream/${path.basename(file.newFilename)}`
          : `http://localhost:${process.env.PORT}/static/video-stream/${path.basename(file.newFilename)}`,
        type: MediaType.Video
      }
    })
    return result
  }

  async uploadVideoHLS(req: IncomingMessage) {
    try {
      const files = await handleUploadVideo(req)
      const result: Media[] = await Promise.all(
        files.map(async (file) => {
          try {
            // Encode video to HLS format
            await encodeHLSWithMultipleVideoStreams(file.newFilename)
            
            // Clean up original video file after successful encoding
            const originalPath = file.newFilename
            if (fs.existsSync(originalPath)) {
              fs.unlinkSync(originalPath)
            }

            const videoName = path.basename(file.newFilename, path.extname(file.newFilename))
            const baseUrl = isProduction ? process.env.HOST : `http://localhost:${process.env.PORT}`
            
            return {
              url: `${baseUrl}/static/video-stream/${videoName}/master.m3u8`,
              type: MediaType.Video
            }
          } catch (error) {
            // Clean up on error
            if (fs.existsSync(file.newFilename)) {
              fs.unlinkSync(file.newFilename)
            }
            throw error
          }
        })
      )
      return result
    } catch (error) {
      console.error('Error in uploadVideoHLS:', error)
      throw error
    }
  }
}

const mediasService = new MediasService()
export default mediasService
