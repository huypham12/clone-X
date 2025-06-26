import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import { MediaType, TweetType } from '~/constants/enums'
import { numberEnumToArray } from '~/utils/common'
import { TweetAudience } from '~/constants/enums'
import { ObjectId } from 'mongodb'
import { isEmpty } from 'lodash'
import databaseService from '~/services/database.services'
import { Request, Response, NextFunction } from 'express'
import Tweet from '~/models/schemas/Tweet.schema'
import { ErrorWithStatus } from '~/models/errors'

const tweetType = numberEnumToArray(TweetType)
const tweetAudience = numberEnumToArray(TweetAudience)
const mediaType = numberEnumToArray(MediaType)

export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [tweetType],
          errorMessage: 'Invalid tweet type'
        }
      },
      audience: {
        isIn: {
          options: [tweetAudience],
          errorMessage: 'Invalid tweet audience'
        }
      },
      parent_id: {
        optional: true,
        custom: {
          options: (value, { req }) => {
            // nếu type là retweet, quote twweet hoặc comment thì parent_id là bắt buộc, còn nếu là tweet thì parrent_id là null
            if (
              [TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(req.body.type) &&
              !ObjectId.isValid(value)
            ) {
              throw new Error('parent_id is required for retweet, comment and quote tweet')
            }
            if (req.body.type === TweetType.Tweet && value !== null) {
              throw new Error('parent_id must be null for tweet type')
            }
            return true
          }
        }
      },
      content: {
        isString: true,
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType
            const hashtags = req.body.hashtags as string[]
            const mentions = req.body.mentions as string[]
            // nếu type là comment, quote tweet, tweet và không có 'mentions' và 'hashtags' thì content là bắt buộc
            if (
              [TweetType.Tweet, TweetType.Comment, TweetType.QuoteTweet].includes(req.body.type) &&
              isEmpty(hashtags) &&
              isEmpty(mentions) &&
              value === ''
            ) {
              throw new Error('content is required for tweet, comment and quote tweet')
            }
            // nếu type là retweet thì content phải là rỗng
            if (type === TweetType.Retweet && value !== '') {
              throw new Error('content must be empty for retweet type')
            }
            return true
          }
        }
      },
      hashtags: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            if (req.body.type === TweetType.Retweet && !isEmpty(value)) {
              throw new Error('hashtags must be empty for retweet type')
            }
            if (value.some((item: any) => typeof item !== 'string')) {
              throw new Error('hashtags must be an array of strings')
            }
            return true
          }
        }
      },
      mentions: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            if (req.body.type === TweetType.Retweet && !isEmpty(value)) {
              throw new Error('mentions must be empty for retweet type')
            }
            if (value.some((item: any) => !ObjectId.isValid(item))) {
              throw new Error('mentions must be an array of user id')
            }
            return true
          }
        }
      },
      medias: {
        optional: true,
        isArray: true,
        custom: {
          options: (value, { req }) => {
            if (req.body.type === TweetType.Retweet && !isEmpty(value)) {
              throw new Error('medias must be empty for retweet type')
            }

            // yêu cầu mỗi phần tử trong array là media object
            //export interface Media {
            //   url: string
            //   type: MediaType
            // }
            /*
           "medias": [
             { "url": "https://cdn.com/image.jpg", "type": 0 },
            { "url": "https://cdn.com/video.mp4", "type": 1 }
          ]
          */

            if (
              value.some((item: any) => {
                return typeof item.url !== 'string' || !mediaType.includes(item.type)
              })
            ) {
              throw new Error('Each media must have a valid string url and a valid media type')
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        isMongoId: {
          errorMessage: 'Invalid tweet id'
        },
        custom: {
          options: async (value, { req }) => {
            const tweet = await databaseService.tweets
              .aggregate<Tweet>([
                {
                  $match: {
                    _id: new ObjectId(value as string)
                  }
                },
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
                    bookmarks: {
                      $size: '$bookmarks'
                    },
                    likes: {
                      $size: '$likes'
                    },
                    retweet_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', TweetType.Retweet]
                          }
                        }
                      }
                    },
                    comment: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', TweetType.Comment]
                          }
                        }
                      }
                    },
                    quote: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', TweetType.QuoteTweet]
                          }
                        }
                      }
                    }
                  }
                },
                {
                  $project: {
                    tweet_children: 0
                  }
                }
              ])
              .toArray()
            if (!tweet) {
              throw new Error('Tweet not found')
            }
            console.log(tweet)
            ;(req as Request).tweet = tweet[0] // gán tweet vào req để các middleware khác có thể sử dụng
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

// nhận vào một handler(request, response, next) và trả về một handler khác
export const isUserLoggedInValidator = (middleware: (req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // req.header và req.headers
    // headers là một object chứa tất cả các header của request, tên của header sẽ được chuyển thành chữ thường
    // req.header(name) là method của express để lấy giá trị của một header cụ thể không phân biệt hoa thường
    if (req.headers.authorization) {
      return middleware(req, res, next) // có access token thì gọi access token validator để check, không thì thôi, vì cái tweet có thể là public tweet hoặc twitter circle cần đăng nhập để xem
    }
    next()
  }
}

// check xem audience có được phép truy cập đến tweet hay không
// nếu là public tweet thì không cần check audience, nếu là twitter circle thì cần check xem
export const audienceValidator = async (req: Request, res: Response, next: NextFunction) => {
  const tweet = (req as Request).tweet as Tweet
  if (tweet.audience === TweetAudience.TwitterCircle) {
    // kiểm tra xem user có phải là member của twitter circle đó hay không
    const { user_id } = req.decoded_authorization as { user_id: string }

    const author = await databaseService.users.findOne({
      _id: tweet.user_id as ObjectId
    })
    const isMember = author?.twitter_circle?.some((user_circle_id) => user_circle_id.equals(new ObjectId(user_id)))
    if (!isMember && !author?._id.equals(new ObjectId(user_id))) {
      return next(
        new ErrorWithStatus({
          message: 'You are not a member of this Twitter Circle',
          status: 403
        })
      )
    }
    return next()
  }
  return next() // nếu là public tweet thì không cần check audience, nếu là twitter circle thì cần check xem user có phải là member của twitter circle đó hay không
}

export const getTweetChildrenValidator = validate(
  checkSchema(
    {
      tweet_type: {
        isIn: {
          options: [tweetType],
          errorMessage: 'Invalid tweet type'
        }
      }
    },
    ['query']
  )
)

export const paginationValidator = validate(
  checkSchema(
    {
      limit: {
        isNumeric: true,
        custom: {
          options: async (values, { req }) => {
            const limit = Number(values)
            if (limit < 1 || limit > 100) {
              throw new Error('Limit must be between 1 and 100')
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: async (values, { req }) => {
            const page = Number(values)
            if (page < 1) {
              throw new Error('Page must be greater than 0')
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
