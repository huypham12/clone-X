import { Request, Response, NextFunction } from 'express'
import { MediaTypeQuery } from '~/constants/enums'
import searchService from '~/services/search.services'

export const searchController = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.decoded_authorization?.user_id as string
  const limit = parseInt(req.query.limit as string) || 10
  const page = parseInt(req.query.page as string) || 1
  const result = await searchService.search({
    content: req.query.content as string,
    user_id,
    people_following: req.query.pf as string,
    media_type: req.query.media_type as MediaTypeQuery,
    limit,
    page
  })
  res.json({ message: 'Search results', result })
}
