// Tweets

import { ObjectId } from 'mongodb'
import { TweetAudience } from '~/constants/enums'
import { Media } from '../Orther'

interface TweetType {
  _id: ObjectId
  user_id: ObjectId // Người sở hữu tweet
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId //  chỉ null khi tweet gốc, một tweet có thể có nhiều tweet con nên cần parent_id để phân cấp
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
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
  guest_views: number
  user_views: number
  created_at: Date
  updated_at: Date

  constructor(twwet: TweetType) {
    const date = new Date()
    this._id = twwet._id || new ObjectId()
    this.user_id = twwet.user_id
    this.type = twwet.type
    this.audience = twwet.audience || TweetAudience.Everyone
    this.content = twwet.content || ''
    this.parent_id = twwet.parent_id || null
    this.hashtags = twwet.hashtags || []
    this.mentions = twwet.mentions || []
    this.medias = twwet.medias || []
    this.guest_views = twwet.guest_views || 0
    this.user_views = twwet.user_views || 0
    this.created_at = twwet.created_at || date
    this.updated_at = twwet.updated_at || date
  }
}
