import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { IncomingMessage } from 'http'
import { ErrorWithStatus } from '~/models/errors'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'
import { File } from 'formidable'
import { get } from 'axios'

export const initFolder = (folderPath: string): void => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true })
  }
}
initFolder(UPLOAD_IMAGE_TEMP_DIR)
initFolder(UPLOAD_VIDEO_TEMP_DIR)

export const handleUploadImage = async (req: IncomingMessage) => {
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    keepExtensions: true,
    maxFiles: 4,
    maxFieldsSize: 300 * 1024, // 300KB
    maxTotalFileSize: 4 * 300 * 1024, // 1.2MB
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

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!files.image) {
        return reject(new ErrorWithStatus({ message: 'No image file uploaded or invalid file name', status: 400 }))
      }
      resolve(files.image as File[])
    })
  })
}

export const handleUploadVideo = async (req: IncomingMessage) => {
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 4,
    maxFieldsSize: 500 * 1024 * 1024, // 500MB
    filter: function ({ name, originalFilename, mimetype }) {
      return true
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!files.video) {
        return reject(new ErrorWithStatus({ message: 'No video file uploaded or invalid file name', status: 400 }))
      }

      const videos = files.video as File[]
      videos.forEach((video) => {
        const ext = getExtension(video.originalFilename || '')
        fs.renameSync(
          video.filepath,
          video.filepath + '.' + ext // Rename file to include its extension
        )
        video.newFilename = video.filepath + '.' + ext // Update newFilename to include extension
      })
      console.log(videos[0].newFilename)

      resolve(files.video as File[])
    })
  })
}

const getExtension = (fullname: string): string => {
  const namearr = fullname.split('.')
  return namearr[namearr.length - 1]
}
