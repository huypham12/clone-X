import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { SearchQuery } from '~/models/requests/Search.requests'
import searchService from '~/services/search.services'

export const searchController = async (
  req: Request<ParamsDictionary, any, any, SearchQuery>,
  res: Response,
  next: NextFunction
) => {
  const user_id = req.decoded_authorization?.user_id as string
  const limit = parseInt(req.query.limit as string) || 10
  const page = parseInt(req.query.page as string) || 1
  const result = await searchService.search({
    query: req.query,
    user_id,
    limit,
    page
  })
  res.json({ result })
}
