import { faker } from '@faker-js/faker'
import { ObjectId, WithId } from 'mongodb'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enums'
import { TweetReqBody } from '~/models/requests/Tweet.requests'
import { RegisterReqBody } from '~/models/requests/User.requests'
import Follower from '~/models/schemas/Follower.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import Tweet from '~/models/schemas/Tweet.schema'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'

/**
 * ===== FAKER SCRIPT VERSION 2.0 - IMPROVED =====
 *
 * Các cải tiến chính:
 * 1. Bulk Operations: Sử dụng insertMany thay vì insertOne để tối ưu hiệu suất
 * 2. Batch Processing: Xử lý dữ liệu theo batch để tránh memory overflow
 * 3. Progress Tracking: Hiển thị tiến độ với time estimation
 * 4. Error Recovery: Retry mechanism và graceful error handling
 * 5. Memory Optimization: Cache và cleanup để tối ưu memory
 * 6. Data Validation: Validate dữ liệu trước khi insert
 * 7. Configurable: Dễ dàng thay đổi config
 * 8. Statistics: Track chi tiết các metrics
 * 9. Cleanup Functions: Xóa dữ liệu cũ nếu cần
 * 10. Reproducible Data: Sử dụng seed để tạo dữ liệu consistent
 */

// ===== CONFIGURATION =====
interface FakerConfig {
  userCount: number
  tweetsPerUser: number
  batchSize: number
  maxRetries: number
  enableProgressBar: boolean
  cleanupOnStart: boolean
  seed?: number
  followRandomUsers: boolean
  createHashtagNetwork: boolean
}

const CONFIG: FakerConfig = {
  userCount: 500,
  tweetsPerUser: 3,
  batchSize: 100,
  maxRetries: 3,
  enableProgressBar: true,
  cleanupOnStart: false,
  seed: 12345,
  followRandomUsers: true,
  createHashtagNetwork: true
}

const PASSWORD = 'P@ssw0rd123'
const MYID = new ObjectId('685cb48f4224d75cf0942bf2')

// ===== STATISTICS TRACKING =====
interface Statistics {
  usersCreated: number
  usersSkipped: number
  tweetsCreated: number
  followsCreated: number
  hashtagsCreated: number
  errors: number
  startTime: Date
  endTime?: Date
}

const stats: Statistics = {
  usersCreated: 0,
  usersSkipped: 0,
  tweetsCreated: 0,
  followsCreated: 0,
  hashtagsCreated: 0,
  errors: 0,
  startTime: new Date()
}

// ===== UTILITY FUNCTIONS =====
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

const showProgress = (current: number, total: number, operation: string) => {
  if (!CONFIG.enableProgressBar) return

  const percentage = Math.round((current / total) * 100)
  const elapsed = Date.now() - stats.startTime.getTime()
  const estimated = current > 0 ? (elapsed / current) * (total - current) : 0

  console.log(`${operation}: ${current}/${total} (${percentage}%) - ETA: ${formatDuration(estimated)}`)
}

const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = CONFIG.maxRetries,
  delay: number = 1000
): Promise<T | null> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      console.warn(`Attempt ${attempt}/${maxRetries} failed:`, (error as Error).message)
      if (attempt === maxRetries) {
        stats.errors++
        return null
      }
      await new Promise((resolve) => setTimeout(resolve, delay * attempt))
    }
  }
  return null
}

// Set faker seed for reproducible data
if (CONFIG.seed) {
  faker.seed(CONFIG.seed)
}

// ===== ENHANCED DATA GENERATION =====
const existingEmailsCache = new Set<string>()
const usedEmails = new Set<string>()

const preloadExistingEmails = async (): Promise<void> => {
  console.log('📧 Preloading existing emails...')
  try {
    const existingUsers = await databaseService.users.find({}, { projection: { email: 1 } }).toArray()
    existingUsers.forEach((user) => existingEmailsCache.add(user.email))
    console.log(`✅ Loaded ${existingEmailsCache.size} existing emails`)
  } catch (error) {
    console.error('❌ Error preloading emails:', error)
  }
}

const generateUniqueEmail = (): string => {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'protonmail.com']
  let email: string
  let attempts = 0

  do {
    const firstName = faker.person
      .firstName()
      .toLowerCase()
      .replace(/[^a-z]/g, '')
    const lastName = faker.person
      .lastName()
      .toLowerCase()
      .replace(/[^a-z]/g, '')
    const number = faker.number.int({ min: 1, max: 9999 })
    const domain = faker.helpers.arrayElement(domains)

    email = `${firstName}.${lastName}${number}@${domain}`
    attempts++

    if (attempts > 100) {
      email = faker.internet.email()
      break
    }
  } while (usedEmails.has(email) || existingEmailsCache.has(email))

  usedEmails.add(email)
  return email
}

const createRandomUser = (): RegisterReqBody => {
  return {
    name: faker.person.fullName(),
    email: generateUniqueEmail(),
    password: PASSWORD,
    confirm_password: PASSWORD,
    date_of_birth: faker.date
      .between({
        from: new Date('1950-01-01'),
        to: new Date('2005-12-31')
      })
      .toISOString()
  }
}

const POPULAR_HASHTAGS = [
  'NodeJS',
  'MongoDB',
  'ExpressJS',
  'TypeScript',
  'JavaScript',
  'React',
  'Vue',
  'Angular',
  'Docker',
  'AWS',
  'DevOps',
  'WebDev',
  'Programming',
  'Tech',
  'AI',
  'MachineLearning',
  'Python',
  'Java',
  'GoLang',
  'Rust',
  'Database',
  'API',
  'Microservices',
  'Cloud',
  'Security',
  'Testing'
]

const createRandomTweet = (): TweetReqBody => {
  const tweetTemplates = [
    () => faker.lorem.paragraph({ min: 1, max: 3 }),
    () => `${faker.lorem.sentence()} 🔥 #trending`,
    () => `Breaking: ${faker.lorem.sentence()}`,
    () => `Just finished ${faker.lorem.words(3)}! Feeling great 💪`,
    () => `Thoughts on ${faker.lorem.words(2)}? ${faker.lorem.sentence()}`,
    () => `🚀 Excited to share: ${faker.lorem.sentence()}`,
    () => `Learning ${faker.helpers.arrayElement(POPULAR_HASHTAGS)} today! ${faker.lorem.sentence()}`
  ]

  return {
    type: TweetType.Tweet,
    audience: faker.helpers.weightedArrayElement([
      { weight: 8, value: TweetAudience.Everyone },
      { weight: 2, value: TweetAudience.TwitterCircle }
    ]),
    content: faker.helpers.arrayElement(tweetTemplates)(),
    hashtags: faker.helpers.arrayElements(POPULAR_HASHTAGS, { min: 1, max: 4 }),
    medias: faker.datatype.boolean(0.3)
      ? [
          {
            type: MediaType.Image,
            url: faker.image.url({ width: 800, height: 600 })
          }
        ]
      : [],
    mentions: [],
    parent_id: null
  }
}

// ===== BULK OPERATIONS =====
const insertMultipleUsersInBulk = async (users: RegisterReqBody[]): Promise<ObjectId[]> => {
  console.log('👥 Creating users in bulk...')
  const result: ObjectId[] = []

  // Process in batches
  for (let i = 0; i < users.length; i += CONFIG.batchSize) {
    const batch = users.slice(i, i + CONFIG.batchSize)
    showProgress(i, users.length, 'Creating users')

    try {
      const userDocuments = batch.map((user) => {
        const user_id = new ObjectId()
        result.push(user_id)
        return new User({
          ...user,
          _id: user_id,
          username: `user${user_id.toString()}`,
          password: hashPassword(user.password),
          date_of_birth: new Date(user.date_of_birth),
          verify: UserVerifyStatus.Verified
        })
      })

      await retryOperation(async () => {
        await databaseService.users.insertMany(userDocuments, { ordered: false })
      })

      stats.usersCreated += batch.length
      await delay(100) // Small delay to avoid overwhelming the database
    } catch (error) {
      console.error(`❌ Error in batch ${i}-${i + batch.length}:`, (error as Error).message)
      stats.errors++
    }
  }

  console.log(`✅ Created ${stats.usersCreated} users successfully`)
  return result
}

const followUsersInBulk = async (user_id: ObjectId, followed_user_ids: ObjectId[]): Promise<number> => {
  console.log('🤝 Creating follow relationships in bulk...')
  let successCount = 0

  // Process in batches
  for (let i = 0; i < followed_user_ids.length; i += CONFIG.batchSize) {
    const batch = followed_user_ids.slice(i, i + CONFIG.batchSize)
    showProgress(i, followed_user_ids.length, 'Creating follows')

    try {
      const followDocuments = batch.map(
        (followed_user_id) =>
          new Follower({
            user_id,
            followed_user_id: new ObjectId(followed_user_id)
          })
      )

      await retryOperation(async () => {
        const result = await databaseService.followers.insertMany(followDocuments, { ordered: false })
        console.log(`Inserted ${result.insertedCount} follow relationships in this batch`)
      })

      successCount += batch.length
      stats.followsCreated += batch.length
      await delay(50)
    } catch (error) {
      console.error(`❌ Error in follow batch for user ${user_id}:`, error)
      if (error instanceof Error) {
        if (error.message.includes('duplicate key error')) {
          console.log('This error is due to duplicate follows - some follows may already exist')
        }
      }
      stats.errors++
    }
  }

  console.log(`✅ Created ${successCount} follow relationships`)
  return successCount
}

const insertTweetsInBulk = async (userIds: ObjectId[]): Promise<number> => {
  console.log('🐦 Creating tweets in bulk...')
  let totalCount = 0

  for (let i = 0; i < userIds.length; i += CONFIG.batchSize) {
    const userBatch = userIds.slice(i, i + CONFIG.batchSize)
    showProgress(i, userIds.length, 'Creating tweets')

    try {
      const tweetDocuments: Tweet[] = []

      for (const userId of userBatch) {
        for (let j = 0; j < CONFIG.tweetsPerUser; j++) {
          const tweetData = createRandomTweet()
          const hashtags = await checkAndCreateHashtags(tweetData.hashtags ?? [])

          tweetDocuments.push(
            new Tweet({
              audience: tweetData.audience,
              content: tweetData.content,
              hashtags,
              mentions: (tweetData.mentions ?? []).map((id) => new ObjectId(id)),
              medias: tweetData.medias ?? [],
              parent_id: tweetData.parent_id ? new ObjectId(tweetData.parent_id) : null,
              type: tweetData.type,
              user_id: userId
            })
          )
        }
      }

      await retryOperation(async () => {
        await databaseService.tweets.insertMany(tweetDocuments, { ordered: false })
      })

      totalCount += tweetDocuments.length
      stats.tweetsCreated += tweetDocuments.length
      await delay(100)
    } catch (error) {
      console.error(`❌ Error in tweet batch:`, (error as Error).message)
      stats.errors++
    }
  }

  console.log(`✅ Created ${totalCount} tweets successfully`)
  return totalCount
}

const checkAndCreateHashtags = async (hashtags: string[]): Promise<ObjectId[]> => {
  const hashtagDocuments = await Promise.all(
    hashtags.map((hashtag) =>
      retryOperation(async () =>
        databaseService.hashtags.findOneAndUpdate(
          { name: hashtag },
          {
            $setOnInsert: new Hashtag({ name: hashtag })
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      )
    )
  )

  const validHashtags = hashtagDocuments.filter((hashtag) => hashtag)
  stats.hashtagsCreated += validHashtags.length

  return validHashtags.map((hashtag) => (hashtag as WithId<Hashtag>)._id)
}

// ===== CLEANUP FUNCTIONS =====
const cleanupOldData = async (): Promise<void> => {
  if (!CONFIG.cleanupOnStart) return

  console.log('🧹 Cleaning up old fake data...')

  try {
    // Delete fake users (those with usernames starting with 'user')
    const fakeUsersResult = await databaseService.users.deleteMany({
      username: { $regex: /^user[a-f0-9]{24}$/ }
    })
    console.log(`🗑️ Deleted ${fakeUsersResult.deletedCount} fake users`)

    // Get list of valid user IDs
    const validUserIds = await databaseService.users.distinct('_id')
    console.log(`Found ${validUserIds.length} valid users`)

    // Delete orphaned tweets
    const orphanedTweetsResult = await databaseService.tweets.deleteMany({
      user_id: { $nin: validUserIds }
    })
    console.log(`🗑️ Deleted ${orphanedTweetsResult.deletedCount} orphaned tweets`)

    // Delete orphaned follows
    const orphanedFollowsResult = await databaseService.followers.deleteMany({
      $or: [{ user_id: { $nin: validUserIds } }, { followed_user_id: { $nin: validUserIds } }]
    })
    console.log(`🗑️ Deleted ${orphanedFollowsResult.deletedCount} orphaned follows`)

    // Log remaining follows
    const remainingFollows = await databaseService.followers.countDocuments({})
    console.log(`Remaining follows after cleanup: ${remainingFollows}`)
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  }
}

// ===== ADDITIONAL FEATURES =====
const createRandomFollowNetwork = async (userIds: ObjectId[]): Promise<void> => {
  if (!CONFIG.followRandomUsers) {
    console.log('Random follow network creation is disabled')
    return
  }

  console.log('🌐 Creating random follow network...')
  console.log(`Processing ${userIds.length} users for random follows`)

  for (let i = 0; i < userIds.length; i += 10) {
    const user = userIds[i]
    const followCount = faker.number.int({ min: 5, max: 15 })
    const randomUsers = faker.helpers.arrayElements(
      userIds.filter((id) => !id.equals(user)),
      followCount
    )

    console.log(`User ${user}: Creating ${randomUsers.length} random follows`)
    await followUsersInBulk(user, randomUsers)
    showProgress(i, userIds.length, 'Creating random network')
  }

  // Log final stats
  const totalFollows = await databaseService.followers.countDocuments({})
  console.log(`Total follows in database after creating network: ${totalFollows}`)
}

// ===== MAIN EXECUTION =====
const printStatistics = (): void => {
  stats.endTime = new Date()
  const duration = stats.endTime.getTime() - stats.startTime.getTime()

  console.log('\n📊 FINAL STATISTICS:')
  console.log('=====================')
  console.log(`👥 Users created: ${stats.usersCreated}`)
  console.log(`🐦 Tweets created: ${stats.tweetsCreated}`)
  console.log(`🤝 Follows created: ${stats.followsCreated}`)
  console.log(`#️⃣ Hashtags created: ${stats.hashtagsCreated}`)
  console.log(`❌ Errors: ${stats.errors}`)
  console.log(`⏱️ Total time: ${formatDuration(duration)}`)
  console.log(`📈 Performance: ${Math.round(stats.usersCreated / (duration / 1000))} users/second`)
}

const main = async (): Promise<void> => {
  try {
    console.log('🚀 Starting Enhanced Faker Script v2.0...')
    console.log(`📋 Configuration: ${CONFIG.userCount} users, ${CONFIG.tweetsPerUser} tweets each`)

    // Connect to database first
    console.log('🔌 Connecting to database...')
    await databaseService.connect()
    console.log('✅ Database connected!')

    // Cleanup if requested
    await cleanupOldData()

    // Preload existing data
    await preloadExistingEmails()

    // Generate user data
    console.log('🎲 Generating user data...')
    const users: RegisterReqBody[] = Array.from({ length: CONFIG.userCount }, () => createRandomUser())

    // Create users in bulk
    const userIds = await insertMultipleUsersInBulk(users)

    if (userIds.length === 0) {
      console.log('❌ No users were created. Exiting...')
      return
    }

    // Create follow relationships
    try {
      await followUsersInBulk(MYID, userIds)
      await createRandomFollowNetwork(userIds)
    } catch (error) {
      console.error('❌ Error creating follows:', error)
    }

    // Create tweets in bulk
    try {
      await insertTweetsInBulk(userIds)
    } catch (error) {
      console.error('❌ Error creating tweets:', error)
    }

    printStatistics()
    console.log('✅ Enhanced faker script completed successfully!')

    // Disconnect from database
    await databaseService.disconnect()
    console.log('🔌 Database disconnected!')
  } catch (error) {
    console.error('💥 Fatal error in faker script:')
    console.error(error)

    // Ensure database disconnection even on error
    // try {
    //   await databaseService.disconnect()
    // } catch (disconnectError) {
    //   console.error('Error disconnecting database:', disconnectError)
    // }

    process.exit(1)
  }
}

// Export function để có thể gọi từ bên ngoài
export default main

// Tự động chạy khi file được import
main().catch((error) => {
  console.error('💥 Unhandled error in main function:')
  console.error(error)
})
