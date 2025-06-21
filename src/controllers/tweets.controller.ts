import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetType } from '~/constants/enums'
import { BookmarkTweetReqBody, LikeTweetReqBody } from '~/models/requests/Tweet.requests'
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

export const getTweetController = async (req: Request<ParamsDictionary>, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const tweet_id = req.params.tweet_id
  const result = await tweetService.increaseView(tweet_id, user_id)
  const tweet = { ...req.tweet, guest_views: result?.guest_views, user_views: result?.user_views } as Tweet
  res.json({
    message: 'Get tweet successfully',
    tweet
  })
}

export const getTweetChildrenController = async (req: Request<ParamsDictionary>, res: Response, next: NextFunction) => {
  const tweet_type = Number(req.query.tweet_type) as TweetType
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 5
  const result = await tweetService.getTweetChildren({
    tweet_id: req.params.tweet_id,
    tweet_type,
    page,
    limit
  })

  res.json({
    message: 'Get tweet children successfully',
    tweets: result.tweets,
    page,
    limit,
    total: result.total,
    total_pages: Math.ceil(result.total / limit)
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

export const likeTweetController = async (
  req: Request<ParamsDictionary, any, LikeTweetReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.body as LikeTweetReqBody
  const result = await tweetService.likeTweet(user_id, tweet_id)
  res.json({
    message: 'Like tweet successfully',
    result
  })
}

export const unlikeTweetController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.params
  await tweetService.unlikeTweet(user_id, tweet_id)
  res.json({
    message: 'Unlike tweet successfully'
  })
}
