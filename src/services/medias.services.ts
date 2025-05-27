import { IncomingMessage } from 'http'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import { handleUploadSingleImage } from '~/utils/file'
import fs from 'fs'
import { config } from 'dotenv'
import { isProduction } from '~/constants/config'
config()

class MediasService {
  async handleUploadSingleImage(req: IncomingMessage) {
    const file = await handleUploadSingleImage(req) // File from formidable or similar
    const oldPath = file.newFilename // full path of uploaded file
    console.log(oldPath)
    const newPath = path.resolve(UPLOAD_DIR, `${oldPath.replace(/\.\w+$/, '.jpeg')}`)
    const info = await sharp(file.filepath).jpeg().toFile(newPath)
    fs.unlinkSync(file.filepath) // xóa file tạm thời sau khi chuyển đổi
    // nếu là môi trường production thì trả về đường dẫn đầy đủ
    // nếu là môi trường development thì trả về đường dẫn localhost
    return isProduction
      ? `${process.env.HOST}/medias/${path.basename(newPath)}`
      : `http://localhost:${process.env.PORT}/medias/${path.basename(newPath)}`
  }
}

const mediasService = new MediasService()
export default mediasService
