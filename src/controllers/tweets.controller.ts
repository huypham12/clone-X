import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BookmarkTweetReqBody } from '~/models/requests/Tweet.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import Tweet from '~/models/schemas/Tweet.schema'
import tweetService from '~/services/tweets.services'

export const createTweetsController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetService.createTweet(user_id, req.body)
  res.json({
    message: 'Create tweet successfully',
    result
  })
}

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.body as BookmarkTweetReqBody
  const result = await tweetService.bookmarkTweet(user_id, tweet_id)
  res.json({
    message: 'Bookmark tweet successfully',
    result
  })
}

export const unbookmarkTweetController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.params
  await tweetService.unbookmarkTweet(user_id, tweet_id)
  res.json({
    message: 'Unbookmark tweet successfully'
  })
}
