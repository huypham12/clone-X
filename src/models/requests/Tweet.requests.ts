import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '../Orther'

export interface TweetReqBody {
  type: TweetType // Loại tweet
  audience: TweetAudience // Đối tượng xem tweet
  content: string // Nội dung tweet
  parent_id?: string | null // Chỉ null khi tweet gốc, một tweet có thể có nhiều tweet con nên cần parent_id để phân cấp
  hashtags?: string[] // Mảng chứa các hashtag liên quan đến tweet
  mentions?: string[] // Mảng chứa các mention liên quan đến tweet
  medias?: Media[] // Mảng chứa các media liên quan đến tweet
}
