import { NextFunction } from 'express'
import { Request, Response } from 'express'
import conversationService from '~/services/conversations.services'

export const getConversationsController = async (req: Request, res: Response, next: NextFunction) => {
  const { receiver_id } = req.params
  const { limit, page } = req.query as { limit?: string; page?: string }
  console.log(limit, page)
  const sender_id = req.decoded_authorization?.user_id as string
  console.log(receiver_id, sender_id)
  const result = await conversationService.getConversations({
    sender_id: sender_id,
    receiver_id: receiver_id,
    limit: limit ? parseInt(limit) : 20,
    page: page ? parseInt(page) : 1
  })
  res.json({
    status: 'success',
    data: result
  })
}
