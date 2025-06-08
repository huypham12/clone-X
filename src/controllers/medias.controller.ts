import { NextFunction, Request, Response } from 'express'
import { IncomingMessage } from 'http'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'
import { usersMessage } from '~/constants/messages'
import mediasService from '~/services/medias.services'
import fs from 'fs'
import mime from 'mime'
import httpStatus from '~/constants/httpStatus'

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

export const serveVideoStreamController = (req: Request, res: Response, next: NextFunction): void => {
  const range = req.headers.range
  if (!range) {
    res.status(400).send('Range header is required for video streaming')
    return
  }
  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)
  // 1MB = 1000 * 1000 bytes trong hệ thập phân
  // 1MB = 1024 * 1024 bytes trong hệ nhị phân
  const videoSize = fs.statSync(videoPath).size
  const CHUNK_SIZE = 2 * 1000 * 1000 // 2MB là dung lượng của mỗi đoạn video
  // range bytes = 0 - 1310719
  const start = Number(range.replace(/\D/g, '')) // Lấy giá trị bắt đầu từ range
  const end = Math.min(start + CHUNK_SIZE - 1, videoSize - 1) // Tính giá trị kết thúc, đảm bảo không vượt quá kích thước video
  // dung lượng thực tế cho mỗi đoạn video thường là chunk size ngoại trừ đoạn cuối cùng
  const contentLength = end - start + 1 // +1 vì start và end đều bao gồm trong đoạn video
  const contentType = mime.getType(videoPath) || 'video/mp4'
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  console.log('hi')
  res.writeHead(httpStatus.PARTIAL_CONTENT, headers)
  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)

  // try {
  //   // Kiểm tra Range header
  //   const range = req.headers.range
  //   if (!range || !range.startsWith('bytes=')) {
  //     // Nếu không có range, gửi toàn bộ video
  //     const videoPath = path.resolve(UPLOAD_VIDEO_DIR, req.params.name)
  //     if (!fs.existsSync(videoPath)) {
  //       res.status(httpStatus.NOT_FOUND).send('Video not found')
  //       return
  //     }
  //     const videoSize = fs.statSync(videoPath).size
  //     const contentType = mime.getType(videoPath) || 'video/mp4'
  //     res.writeHead(httpStatus.OK, {
  //       'Content-Length': videoSize,
  //       'Content-Type': contentType,
  //       'Accept-Ranges': 'bytes',
  //       'Cache-Control': 'public, max-age=31536000',
  //       Connection: 'keep-alive'
  //     })
  //     fs.createReadStream(videoPath).pipe(res)
  //     return
  //   }

  //   const { name } = req.params
  //   const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)

  //   // Kiểm tra file tồn tại
  //   if (!fs.existsSync(videoPath)) {
  //     res.status(httpStatus.NOT_FOUND).send('Video not found')
  //     return
  //   }

  //   // Lấy kích thước video
  //   const videoSize = fs.statSync(videoPath).size

  //   // Parse Range header
  //   const rangeMatch = range.match(/bytes=(\d+)-(\d*)/)
  //   if (!rangeMatch) {
  //     res.status(httpStatus.BAD_REQUEST).send('Invalid Range header format')
  //     return
  //   }
  //   const CHUNK_SIZE = 4 * 1024 * 1024

  //   const start = Number(rangeMatch[1])
  //   const endRequested = rangeMatch[2] ? Number(rangeMatch[2]) : null
  //   const end =
  //     endRequested && endRequested < videoSize ? endRequested : Math.min(start + CHUNK_SIZE - 1, videoSize - 1)

  //   // Kiểm tra range hợp lệ
  //   if (start >= videoSize || start < 0 || (endRequested && end < start)) {
  //     res.status(httpStatus.REQUESTED_RANGE_NOT_SATISFIABLE).send('Requested range not satisfiable')
  //     return
  //   }

  //   const contentLength = end - start + 1
  //   const contentType = mime.getType(videoPath) || 'video/mp4'

  //   // Thiết lập headers
  //   const headers = {
  //     'Content-Range': `bytes ${start}-${end}/${videoSize}`,
  //     'Accept-Ranges': 'bytes',
  //     'Content-Length': contentLength,
  //     'Content-Type': contentType,
  //     'Cache-Control': 'public, max-age=31536000',
  //     Connection: 'keep-alive',
  //     'Content-Disposition': `inline; filename="${name}"` // Thêm để hỗ trợ trình phát
  //   }

  //   // Gửi phản hồi partial content
  //   res.writeHead(httpStatus.PARTIAL_CONTENT, headers)

  //   // Tạo stream với highWaterMark lớn hơn
  //   const videoStream = fs.createReadStream(videoPath, {
  //     start,
  //     end,
  //     highWaterMark: 256 * 1024 // Tăng lên 256KB
  //   })

  //   // Xử lý lỗi stream
  //   videoStream.on('error', (error) => {
  //     console.error(`Stream error for ${videoPath}:`, error)
  //     res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Error streaming video')
  //   })

  //   // Log chi tiết
  //   videoStream.on('data', () => {
  //     console.log(`Streaming ${name}, range: ${start}-${end}, sent: ${contentLength}`)
  //   })

  //   videoStream.on('end', () => {
  //     console.log(`Finished streaming range ${start}-${end} for ${name}`)
  //   })

  //   // Pipe stream vào response
  //   videoStream.pipe(res)
  // } catch (error) {
  //   console.error('Error in serveVideoStreamController:', error)
  //   next(error)
  // }
}
