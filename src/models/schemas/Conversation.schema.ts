import { ObjectId } from 'mongodb'

interface ConversationType {
  _id?: ObjectId
  sender_id: string
  receiver_id: string
  content: string
  created_at?: Date
  updated_at?: Date
}

export default class Conversation {
  _id?: ObjectId
  sender_id: ObjectId
  receiver_id: ObjectId
  content?: string // Nội dung tin nhắn, có thể là chuỗi hoặc không
  created_at: Date
  updated_at?: Date

  constructor(data: ConversationType) {
    this._id = data._id || new ObjectId()
    this.sender_id = new ObjectId(data.sender_id)
    this.receiver_id = new ObjectId(data.receiver_id)
    this.content = data.content || '' // Nếu không có nội dung, mặc định là chuỗi rỗng
    // Nếu không có ngày tạo, mặc định là ngày hiện tại
    this.created_at = data.created_at ?? new Date()
    if (data.updated_at) {
      this.updated_at = data.updated_at
    }
  }
}
