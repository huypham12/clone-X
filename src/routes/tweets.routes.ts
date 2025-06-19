import { create } from 'axios'
import { Router } from 'express'
import { createTweetsController } from '~/controllers/tweets.controller'
import { createTweetValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrap } from '~/utils/handlers'

const tweetsRouter = Router()

/*
  Description: Create a new tweet
  Method: POST
  Path: /create

*/
tweetsRouter.post(
  '/create',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrap(createTweetsController)
)

export default tweetsRouter
