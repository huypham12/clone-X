import { IncomingMessage } from 'http'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import { handleUploadImage } from '~/utils/file'
import fs from 'fs'
import { config } from 'dotenv'
import { isProduction } from '~/constants/config'
import { MediaType } from '~/constants/enums'
config()
import { Media } from '~/models/Orther'

class MediasService {
  async handleUploadImage(req: IncomingMessage) {
    const files = await handleUploadImage(req) // File from formidable or similar
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const oldPath = file.newFilename // full path of uploaded file
        console.log(oldPath)
        const newPath = path.resolve(UPLOAD_DIR, `${oldPath.replace(/\.\w+$/, '.jpeg')}`)
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
}

const mediasService = new MediasService()
export default mediasService
