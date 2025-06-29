import { ParsedQs } from 'qs'
import { MediaTypeQuery } from '~/constants/enums'

export interface SearchQuery extends ParsedQs {
  content?: string
  media_type: MediaTypeQuery
  people_following?: string | string[]
}
