```ts
use Clone-X



// USERS 
enum UserVerifyStatus {
  Unverified, // chưa xác thực email, mặc định = 0
  Verified, // đã xác thực email
  Banned // bị khóa
}
interface User {
  _id: ObjectId
  name: string
  email: string
  date_of_birth: Date
  password: string
  created_at: Date
  updated_at: Date
  email_verify_token: string // jwt hoặc '' nếu đã xác thực email
  forgot_password_token: string // jwt hoặc '' nếu đã xác thực email
  verify: UserVerifyStatus

  bio: string // optional
  location: string // optional
  website: string // optional
  username: string // optional
  avatar: string // optional
  cover_photo: string // optional
}

// Refresh token
// Vì khi duy trì đăng nhập sẽ có thể có nhiều refresh token nên cần tạo riêng một collection
interface RefreshToken {
  _id: ObjectId
  token: string
  created_at: Date
  user_id: ObjectId
}

// Flowler
interface Follower {
  _id: ObjectId
  user_id: ObjectId
  followed_user_id: ObjectId
  created_at: Date
}

// Tweets
interface Tweet {
  _id: ObjectId
  user_id: ObjectId // Người sở hữu tweet
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId //  chỉ null khi tweet gốc, một tweet có thể có nhiều tweet con nên cần parent_id để phân cấp
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  created_at: Date
  updated_at: Date
}
interface Media {
  url: string
  type: MediaType // video, image
}
enum MediaType {
  Image,
  Video
}
enum TweetAudience {
  Everyone, // 0
  TwitterCircle // 1
}
enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}

// Bookmark
interface Bookmark {
  _id: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at: Date
}

// Like
interface Like {
  _id: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at: Date
}

// Hashtags
// vì hashtags mục đích là để phân loại các tweet ví dụ như #relax #learning chẳng hạn
interface Hashtag {
  _id: ObjectId
  name: string
  created_at: Date
}



/*
  Cần tìm hiểu về 
  - Cách tạo collection có validator
  - Index trong mongo
*/

```
