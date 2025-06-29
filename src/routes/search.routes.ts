import { Router } from 'express'
import { wrap } from '~/utils/handlers'
import { searchController } from '~/controllers/search.controller'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { searchValidator } from '~/middlewares/search.middlewares'

const searchRouter = Router()

searchRouter.get('/', accessTokenValidator, verifiedUserValidator, searchValidator, wrap(searchController))

export default searchRouter
