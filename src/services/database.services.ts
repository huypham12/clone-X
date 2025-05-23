import { MongoClient, Db, Collection } from 'mongodb'
// cấu hình biến môi trường
import { config } from 'dotenv'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Followers from '~/models/schemas/Followers.schema'
config()

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@clone-x.wrxpqkb.mongodb.net/?appName=Clone-X`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

class DatabaseService {
  private client: MongoClient
  private db: Db
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

  get followers(): Collection<Followers> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
  }
}

// tạo object
const databaseService = new DatabaseService()
export default databaseService

// Huy
// GdZadvA33iF9sC
