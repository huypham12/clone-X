import { NextFunction, Request, Response } from 'express'
import { IncomingMessage } from 'http'
import path from 'path'
import { UPLOAD_DIR } from '~/constants/dir'
import { usersMessage } from '~/constants/messages'
import mediasService from '~/services/medias.services'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.handleUploadImage(req as IncomingMessage)
  console.log(url)
  res.json({
    message: usersMessage.UPLOAD_IMAGE_SUCCESS,
    url
  })
}

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  res.sendFile(path.resolve(UPLOAD_DIR, name), (err) => {
    if (err) {
      console.error('Error serving image:', err)
      res.status(404).json({ message: 'Image not found' })
    } else {
      console.log('Image served successfully:', name)
    }
  })
}
