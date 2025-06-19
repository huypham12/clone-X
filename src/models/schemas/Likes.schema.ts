import { ObjectId } from 'mongodb'

// Like
interface Like {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at?: Date
}

export default class LikeModel {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at?: Date
  constructor({ user_id, tweet_id }: Like) {
    this._id = new ObjectId()
    this.user_id = new ObjectId(user_id)
    this.tweet_id = new ObjectId(tweet_id)
    this.created_at = new Date()
  }
}
