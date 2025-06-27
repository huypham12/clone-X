import { Router } from 'express'
import { wrap } from '~/utils/handlers'
import { searchController } from '~/controllers/search.controller'

const searchRouter = Router()

searchRouter.get('/', wrap(searchController))

export default searchRouter
