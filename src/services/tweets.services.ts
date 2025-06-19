import { TweetReqBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtags.schema'
import { hash } from 'crypto'

class TweetService {
  async checkAndCreateHashtags(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtags.map(async (hashtag) => {
        return databaseService.hashtags.findOneAndUpdate(
          { name: hashtag },
          { $setOnInsert: new Hashtag({ name: hashtag }) },
          { upsert: true, returnDocument: 'after' }
        )
      })
    )
    return hashtagDocuments
  }
  async createTweet(user_id: string, body: TweetReqBody) {
    const hashtags = (await this.checkAndCreateHashtags(body.hashtags || [])).map(
      (hashtag) => (hashtag as WithId<Hashtag>)._id
    )

    console.log(hashtags)
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        user_id: new ObjectId(user_id),
        audience: body.audience,
        content: body.content,
        type: body.type,
        parent_id: body.parent_id ? new ObjectId(body.parent_id) : null,
        hashtags,
        mentions: body.mentions ? body.mentions.map((mention) => new ObjectId(mention)) : [],
        medias: body.medias || []
      })
    )
    console.log(result)
    return result
  }
}

const tweetService = new TweetService()
export default tweetService
