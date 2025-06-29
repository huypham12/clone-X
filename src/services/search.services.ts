import { SearchQuery } from '~/models/requests/Search.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { MediaTypeQuery, TweetType } from '~/constants/enums'
import { ObjectId } from 'mongodb'

class SearchService {
  async search({
    content,
    user_id,
    people_following,
    media_type,
    limit,
    page
  }: {
    content: string
    user_id: string
    people_following?: string
    media_type?: MediaTypeQuery
    limit: number
    page: number
  }): Promise<Tweet[]> {
    if (typeof content !== 'string' || !content.trim()) {
      return []
    }

    const user_id_obj = new ObjectId(user_id)
    let ids: ObjectId[] = []

    if (people_following === 'true') {
      const followed_user_ids = await databaseService.followers
        .find({ user_id: user_id_obj }, { projection: { followed_user_id: 1, _id: 0 } })
        .toArray()

      ids = followed_user_ids.map((f) => f.followed_user_id)
      ids.push(user_id_obj)
    }

    const matchCondition: any = {
      $text: {
        $search: content
      }
    }

    if (ids.length > 0) {
      matchCondition.user_id = { $in: ids }
    }

    const result = await databaseService.tweets
      .aggregate<Tweet>([
        { $match: matchCondition },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user_info'
          }
        },
        { $unwind: '$user_info' },
        {
          $match: {
            $or: [
              { audience: 0 },
              {
                $and: [
                  { audience: 1 },
                  {
                    'user.twitter_circle': { $in: [user_id_obj] } // sửa đúng field name
                  }
                ]
              }
            ]
          }
        },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtags'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions'
          }
        },
        {
          $addFields: {
            mentions: {
              $map: {
                input: '$mentions',
                as: 'mention',
                in: {
                  _id: '$$mention._id',
                  name: '$$mention.name',
                  user_name: '$$mention.username',
                  email: '$$mention.email'
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'bookmarks'
          }
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'likes'
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'tweet_children'
          }
        },
        {
          $addFields: {
            bookmarks: { $size: '$bookmarks' },
            likes: { $size: '$likes' },
            retweet_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: { $eq: ['$$item.type', TweetType.Retweet] }
                }
              }
            },
            comment: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: { $eq: ['$$item.type', TweetType.Comment] }
                }
              }
            },
            quote: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: { $eq: ['$$item.type', TweetType.QuoteTweet] }
                }
              }
            }
          }
        },
        {
          $project: {
            tweet_children: 0,
            user_info: {
              password: 0,
              forgot_password_token: 0,
              twitter_circle: 0,
              date_of_birth: 0,
              created_at: 0,
              updated_at: 0,
              email_verify_token: 0
            }
          }
        }
      ])
      .toArray()

    return result
  }
}

const searchService = new SearchService()
export default searchService
