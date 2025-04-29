import { MongoClient } from 'mongodb'
// cấu hình biến môi trường
import { config } from 'dotenv'
config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@clone-x.wrxpqkb.mongodb.net/?appName=Clone-X`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

class DatabaseService {
  private client: MongoClient
  constructor() {
    this.client = new MongoClient(uri)
  }

  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.client.db('admin').command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (err) {
      console.error('MongoDB connection error:', err)
      throw err
    }
  }
  async disconnect() {
    await this.client.close()
  }
}

// tạo object
const databaseService = new DatabaseService()
export default databaseService

// Huy
// GdZadvA33iF9sC
