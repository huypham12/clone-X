import { Request, Response } from 'express'
import formidable from 'formidable'
import path from 'path'
import fs from 'fs'
import { initFolder } from '~/utils/file'
export const uploadSingleImageController = async (req: Request, res: Response) => {
  const uploadDir = path.resolve('uploads/images')
  initFolder(uploadDir)
  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFiles: 1,
    maxFieldsSize: 300 * 1024
  })

  form.parse(req, (err, fields, files) => {
    if (err) {
      throw err
    }
    res.json({ mess: 'Upload image successfully' })
  })
}
