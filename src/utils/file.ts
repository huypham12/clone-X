import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { IncomingMessage } from 'http'
import { ErrorWithStatus } from '~/models/errors'
import { UPLOAD_TEMP_DIR } from '~/constants/dir'
import { File } from 'formidable'

export const initFolder = (folderPath: string): void => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true })
  }
}
initFolder(UPLOAD_TEMP_DIR)
export const handleUploadSingleImage = async (req: IncomingMessage) => {
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR,
    keepExtensions: true,
    maxFiles: 1,
    maxFieldsSize: 300 * 1024, // 300KB
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit(
          'error' as any,
          new ErrorWithStatus({ message: 'Invalid file type: Only images are allowed', status: 400 }) as any
        )
      }
      return valid
    }
  })

  return new Promise<File>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!files.image) {
        return reject(new ErrorWithStatus({ message: 'No image file uploaded or invalid file name', status: 400 }))
      }
      resolve((files.image as File[])[0])
    })
  })
}
