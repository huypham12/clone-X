import { Router } from 'express'
import { getConversationsController } from '~/controllers/conversation.controller'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'

const conversationRouter = Router()

conversationRouter.get(
  '/receivers/:receiver_id',
  accessTokenValidator,
  verifiedUserValidator,
  getConversationsController
)

export default conversationRouter
