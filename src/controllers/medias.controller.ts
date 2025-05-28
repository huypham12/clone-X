import { NextFunction, Request, Response } from 'express'
import { IncomingMessage } from 'http'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'
import { usersMessage } from '~/constants/messages'
import mediasService from '~/services/medias.services'
import fs from 'fs'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.uploadImage(req as IncomingMessage)
  res.json({
    message: usersMessage.UPLOAD_IMAGE_SUCCESS,
    url
  })
}

export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.uploadVideo(req as IncomingMessage)
  res.json({
    message: usersMessage.UPLOAD_VIDEO_SUCCESS,
    url
  })
}

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      console.error('Error serving image:', err)
      res.status(404).json({ message: 'Image not found' })
    } else {
      console.log('Image served successfully:', name)
    }
  })
}

export const serveVideoController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  const filePath = path.resolve(UPLOAD_VIDEO_DIR, name)

  // Kiểm tra file tồn tại trước
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ message: 'Video not found' })
    return
  }

  // Gửi đúng Content-Type để trình duyệt hiển thị video
  if (name.endsWith('.mp4')) {
    res.setHeader('Content-Type', 'video/mp4')
  }

  res.sendFile(filePath, (err) => {
    if (err) {
      // Nếu client đã hủy kết nối thì không gửi thêm gì nữa
      if (res.headersSent) {
        console.warn('Client aborted request while serving video:', name)
        return
      }

      console.error('Error serving video:', err)
      res.status(500).json({ message: 'Error serving video' })
    } else {
      console.log('Video served successfully:', name)
    }
  })
}
