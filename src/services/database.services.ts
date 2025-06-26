import { MongoClient, Db, Collection } from 'mongodb'
// cấu hình biến môi trường
import { config } from 'dotenv'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Follower from '~/models/schemas/Follower.schema'
import test from 'node:test'
import e from 'express'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtags from '~/models/schemas/Hashtag.schema'
import { Hash } from 'crypto'
import BookmarkModel from '~/models/schemas/Bookmark.schema'
import LikeModel from '~/models/schemas/Like.schema'
config()

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@clone-x.wrxpqkb.mongodb.net/?appName=Clone-X`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

class DatabaseService {
  private client: MongoClient
  private db: Db
  ObjectId: any
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (err) {
      console.error('MongoDB connection error:', err)
      throw err
    }
  }

  async indexUser() {
    const exists = await this.users.indexExists(['email_1', 'username_1', 'email_1_password_1'])
    if (exists) {
      return
    }
    console.log('Creating index for users collection...')
    // Tạo chỉ mục cho trường email trong collection users
    await this.users.createIndex({ email: 1 }, { unique: true })
    await this.users.createIndex({ username: 1 }, { unique: true })
    // tạo index cho email và password trong collection users
    await this.users.createIndex({ email: 1, password: 1 })
  }

  async indexRefreshToken() {
    const exists = await this.refreshTokens.indexExists(['token_1', 'exp_1'])
    if (exists) {
      return
    }
    await this.refreshTokens.createIndex({ token: 1 })
    await this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 }) //tự động xóa token sau khi hết hạn
  }
  async indexFollowers() {
    const exists = await this.followers.indexExists(['user_id_1_followed_user_id_1'])
    if (exists) {
      return
    }
    await this.followers.createIndex({ user_id: 1, followed_user_id: 1 }, { unique: true }) // tạo index cho user_id và followed_user_id
  }

  async disconnect() {
    await this.client.close()
  }

  // lấy các collection trong database

  // get là một accessor gọi như một thuộc tính chứ không gọi theo kiểu method()
  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKEN_COLLECTION as string)
  }
  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEETS_COLLECTION as string)
  }
  get hashtags(): Collection<Hashtags> {
    return this.db.collection(process.env.DB_HASHTAGS_COLLECTION as string)
  }

  get bookmarks(): Collection<BookmarkModel> {
    return this.db.collection(process.env.DB_BOOKMARKS_COLLECTION as string)
  }

  get likes(): Collection<LikeModel> {
    return this.db.collection(process.env.DB_LIKES_COLLECTION as string)
  }

  get test() {
    return this.db.collection('test')
  }
}

// tạo object
const databaseService = new DatabaseService()
export default databaseService

// Huy
// GdZadvA33iF9sC
