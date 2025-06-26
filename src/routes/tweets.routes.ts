import { create, get } from 'axios'
import { Router } from 'express'
import {
  bookmarkTweetController,
  createTweetsController,
  getNewFeedController,
  getTweetChildrenController,
  getTweetController,
  likeTweetController,
  unbookmarkTweetController,
  unlikeTweetController
} from '~/controllers/tweets.controller'
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  isUserLoggedInValidator,
  paginationValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrap } from '~/utils/handlers'

const tweetsRouter = Router()

/*
  Description: Get new feed 
  Method: GET
  Path: /new-feed
  Headers: Authorization (Bearer token)
  Query: { page: number, limit: number }

*/
tweetsRouter.get(
  '/new-feed',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  wrap(getNewFeedController)
)

/*
  Description: Create a new tweet
  Method: POST
  Path: /create
  Headers: Authorization (Bearer token)

*/
tweetsRouter.post(
  '/create',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrap(createTweetsController)
)

/*
  Description: Bookmark a tweet
  Method: POST
  Headers: Authorization (Bearer token)
  Body: { tweetId: string }
*/
tweetsRouter.post(
  '/bookmarks',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrap(bookmarkTweetController)
)

/*
  Description: Unbookmark a tweet
  Method: DELETE
  Headers: Authorization (Bearer token)
  Path: /bookmarks/:tweet_id
*/
tweetsRouter.delete(
  '/bookmarks/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrap(unbookmarkTweetController) // Assuming the same controller handles both bookmark and unbookmark
)

/*
  Description: Like a tweet
  Method: POST
  Headers: Authorization (Bearer token)
  Body: { tweetId: string }
*/
tweetsRouter.post('/likes', accessTokenValidator, verifiedUserValidator, tweetIdValidator, wrap(likeTweetController))

/*
  Description: unlike a tweet
  Method: DELETE
  Headers: Authorization (Bearer token)
  Path: /bookmarks/:tweet_id
*/
tweetsRouter.delete(
  '/likes/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrap(unlikeTweetController) // Assuming the same controller handles both bookmark and unbookmark
)

/*
  Description: Get tweet
  Method: GET
  Path: /
  Headers: Authorization (Bearer token)
*/
tweetsRouter.get(
  '/:tweet_id',
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  tweetIdValidator,
  wrap(audienceValidator),
  wrap(getTweetController)
)

/*
  Description: Get tweet children
  Method: GET
  Path: /:tweet_id/children
  Headers: Authorization (Bearer token)
  Query: { page: number, limit: number, tweet_type: TweetType }

*/
tweetsRouter.get(
  '/:tweet_id/children',
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  tweetIdValidator,
  getTweetChildrenValidator,
  paginationValidator,
  wrap(audienceValidator),
  wrap(getTweetChildrenController)
)

export default tweetsRouter
