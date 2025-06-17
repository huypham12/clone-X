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

export const uploadVideoHLSController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.uploadVideoHLS(req as IncomingMessage)
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
  try {
    const range = req.headers.range
    if (!range) {
      res.status(400).send('Range header is required for video streaming')
      return
    }

    const { name } = req.params
    const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)

    // Kiểm tra file tồn tại
    if (!fs.existsSync(videoPath)) {
      res.status(404).json({ message: 'Video not found' })
      return
    }

    // Lấy kích thước video
    const videoSize = fs.statSync(videoPath).size

    // Parse Range header
    const rangeMatch = range.match(/bytes=(\d+)-(\d*)/)
    if (!rangeMatch) {
      res.status(400).send('Invalid Range header format')
      return
    }

    const CHUNK_SIZE = 2 * 1024 * 1024 // 2MB
    const start = Number(rangeMatch[1])
    const endRequested = rangeMatch[2] ? Number(rangeMatch[2]) : null
    const end =
      endRequested && endRequested < videoSize ? endRequested : Math.min(start + CHUNK_SIZE - 1, videoSize - 1)

    // Kiểm tra range hợp lệ
    if (start >= videoSize || start < 0 || (endRequested && end < start)) {
      res.status(416).send('Requested range not satisfiable')
      return
    }

    const contentLength = end - start + 1
    const contentType = mime.getType(videoPath) || 'video/mp4'

    // Thiết lập headers
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000',
      'Access-Control-Allow-Origin': '*'
    }

    // Gửi phản hồi partial content
    res.writeHead(206, headers)

    // Tạo stream với highWaterMark lớn hơn
    const videoStream = fs.createReadStream(videoPath, {
      start,
      end,
      highWaterMark: 256 * 1024 // 256KB
    })

    // Xử lý lỗi stream
    videoStream.on('error', (error) => {
      console.error(`Stream error for ${videoPath}:`, error)
      res.status(500).send('Error streaming video')
    })

    // Pipe stream vào response
    videoStream.pipe(res)
  } catch (error) {
    console.error('Error in serveVideoStreamController:', error)
    res.status(500).send('Internal server error')
  }
}

export const serveHLSController = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { name, variant, file } = req.params
    console.log('HLS Request params:', { name, variant, file })

    const videoName = path.basename(name, path.extname(name))
    console.log('Video name:', videoName)

    // Set common headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 'public, max-age=31536000') // Cache for 1 year for segments

    // Handle master playlist
    if (file === 'master.m3u8') {
      const masterPath = path.resolve(UPLOAD_VIDEO_DIR, videoName, 'master.m3u8')
      console.log('Attempting to serve master playlist from:', masterPath)

      if (!fs.existsSync(masterPath)) {
        console.error('Master playlist not found at:', masterPath)
        // List directory contents for debugging
        const parentDir = path.dirname(masterPath)
        if (fs.existsSync(parentDir)) {
          console.log('Directory contents:', fs.readdirSync(parentDir))
        } else {
          console.error('Parent directory does not exist:', parentDir)
        }
        res.status(404).json({ message: 'Master playlist not found' })
        return
      }

      // Read and serve the master playlist
      const masterContent = fs.readFileSync(masterPath, 'utf-8')
      console.log('Master playlist content:', masterContent)

      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
      res.setHeader('Cache-Control', 'public, max-age=60') // Cache for 1 minute
      res.send(masterContent)
      return
    }

    // Handle variant playlists and segments
    if (!variant || !file) {
      console.error('Missing variant or file parameter:', { variant, file })
      res.status(400).json({ message: 'Missing variant or file parameter' })
      return
    }

    const hlsPath = path.resolve(UPLOAD_VIDEO_DIR, videoName, `v${variant}`, file)
    console.log('Attempting to serve HLS file from:', hlsPath)

    if (!fs.existsSync(hlsPath)) {
      console.error('HLS file not found at:', hlsPath)
      // List directory contents for debugging
      const parentDir = path.dirname(hlsPath)
      if (fs.existsSync(parentDir)) {
        console.log('Directory contents:', fs.readdirSync(parentDir))
      } else {
        console.error('Parent directory does not exist:', parentDir)
      }
      res.status(404).json({ message: 'HLS file not found' })
      return
    }

    // Set appropriate content type
    const contentType = file.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/MP2T'
    res.setHeader('Content-Type', contentType)

    // Create read stream with optimized buffer size
    const fileStream = fs.createReadStream(hlsPath, {
      highWaterMark: 64 * 1024 // 64KB chunks for better performance
    })

    // Handle stream errors
    fileStream.on('error', (error) => {
      console.error(`Stream error for ${hlsPath}:`, error)
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error streaming HLS content' })
      }
    })

    // Handle client disconnect
    req.on('close', () => {
      fileStream.destroy()
    })

    fileStream.pipe(res)
  } catch (error) {
    console.error('Error in serveHLSController:', error)
    if (!res.headersSent) {
      res.status(500).json({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
