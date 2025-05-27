import { NextFunction, Request, Response } from 'express'
import { handleUploadSingleImage } from '~/utils/file'
import { IncomingMessage } from 'http'
export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await handleUploadSingleImage(req)
  res.json({
    message: 'Image uploaded successfully',
    result
  })
}
