import { create, get } from 'axios'
import { Router } from 'express'
import {
  bookmarkTweetController,
  createTweetsController,
  getTweetController,
  likeTweetController,
  unbookmarkTweetController,
  unlikeTweetController
} from '~/controllers/tweets.controller'
import {
  audienceValidator,
  createTweetValidator,
  isUserLoggedInValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrap } from '~/utils/handlers'

const tweetsRouter = Router()

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

export default tweetsRouter
