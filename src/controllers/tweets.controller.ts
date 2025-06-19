import { Request, Response, NextFunction } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import tweetService from '~/services/tweets.services'

export const createTweetsController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetService.createTweet(user_id, req.body)
  res.json({
    message: 'Create tweet successfully',
    result
  })
}
