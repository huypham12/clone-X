import { NextFunction, Request, Response } from 'express'
import { IncomingMessage } from 'http'
import mediasService from '~/services/medias.services'
import { handleUploadSingleImage } from '~/utils/file'
export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasService.handleUploadSingleImage(req as IncomingMessage)
  res.json({
    message: 'Image uploaded successfully',
    result
  })
}
