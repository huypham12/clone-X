import { ObjectId } from 'mongodb'

export interface FollowersType {
  _id?: ObjectId
  user_id: ObjectId
  followed_user_id: ObjectId // id của người được theo dõi
  created_at?: Date
}

export default class Follower {
  _id?: ObjectId
  user_id: ObjectId
  followed_user_id: ObjectId
  created_at?: Date

  constructor({ _id, user_id, followed_user_id, created_at }: FollowersType) {
    this._id = _id || new ObjectId()
    this.user_id = user_id
    this.followed_user_id = followed_user_id
    this.created_at = created_at || new Date()
  }
}
