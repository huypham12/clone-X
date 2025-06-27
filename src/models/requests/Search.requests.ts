import { ParsedQs } from 'qs'

export interface SearchQuery extends ParsedQs {
  content?: string
}
