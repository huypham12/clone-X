import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import { MediaType, TweetType } from '~/constants/enums'
import { numberEnumToArray } from '~/utils/common'
import { TweetAudience } from '~/constants/enums'
import { ObjectId } from 'mongodb'
import { isEmpty } from 'lodash'

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
