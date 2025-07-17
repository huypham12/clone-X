import databaseService from './database.services'
import { ObjectId } from 'mongodb'

class ConversationService {
  async getConversations({
    sender_id,
    receiver_id,
    limit,
    page
  }: {
    sender_id: string
    receiver_id: string
    limit?: number
    page?: number
  }) {
    const conversation = await databaseService.conversations
      .find({
        $or: [
          { sender_id: new ObjectId(sender_id), receiver_id: new ObjectId(receiver_id) },
          { sender_id: new ObjectId(receiver_id), receiver_id: new ObjectId(sender_id) }
        ]
      })
      .skip(limit ? (page ? (page - 1) * limit : 0) : 0)
      .limit(limit || 20)
      .toArray()
    return conversation
  }
}

const conversationService = new ConversationService()
export default conversationService
