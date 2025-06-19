// Tweets

import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '../Orther'

interface TweetConstructor {
  _id?: ObjectId
  user_id: ObjectId // Người sở hữu tweet
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId //  chỉ null khi tweet gốc, một tweet có thể có nhiều tweet con nên cần parent_id để phân cấp
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views?: number
  user_views?: number
  created_at?: Date
  updated_at?: Date
}

export default class Tweet {
  _id?: ObjectId
  user_id: ObjectId // Người sở hữu tweet
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId
  hashtags: ObjectId[] // Mảng chứa các hashtag liên quan đến tweet
  mentions: ObjectId[]
  medias: Media[]
  guest_views?: number
  user_views?: number
  created_at?: Date
  updated_at?: Date

  constructor(tweet: TweetConstructor) {
    const date = new Date()
    this._id = tweet._id || new ObjectId()
    this.user_id = tweet.user_id
    this.type = tweet.type
    this.audience = tweet.audience || TweetAudience.Everyone
    this.content = tweet.content || ''
    this.parent_id = tweet.parent_id || null
    this.hashtags = tweet.hashtags || []
    this.mentions = tweet.mentions || []
    this.medias = tweet.medias || []
    this.guest_views = tweet.guest_views || 0
    this.user_views = tweet.user_views || 0
    this.created_at = tweet.created_at || date
    this.updated_at = tweet.updated_at || date
  }
}
