import { create } from 'axios'
import { Router } from 'express'
import {
  bookmarkTweetController,
  createTweetsController,
  likeTweetController,
  unbookmarkTweetController,
  unlikeTweetController
} from '~/controllers/tweets.controller'
import { createTweetValidator } from '~/middlewares/tweets.middlewares'
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
  Description: Bookmark a tweet
  Method: POST
  Headers: Authorization (Bearer token)
  Body: { tweetId: string }
*/
tweetsRouter.post('/bookmarks', accessTokenValidator, verifiedUserValidator, wrap(bookmarkTweetController))

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
  wrap(unbookmarkTweetController) // Assuming the same controller handles both bookmark and unbookmark
)

/*
  Description: Like a tweet
  Method: POST
  Headers: Authorization (Bearer token)
  Body: { tweetId: string }
*/
tweetsRouter.post('/likes', accessTokenValidator, verifiedUserValidator, wrap(likeTweetController))

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
  wrap(unlikeTweetController) // Assuming the same controller handles both bookmark and unbookmark
)

export default tweetsRouter
