```ts
📦nodejs-typescript 
 ┣ 📂dist
 ┣ 📂src
 ┃ ┣ 📂constants
 ┃ ┃ ┣ 📜enum.ts
 ┃ ┃ ┣ 📜httpStatus.ts
 ┃ ┃ ┗ 📜message.ts
 ┃ ┣ 📂controllers
 ┃ ┃ ┗ 📜users.controllers.ts
 ┃ ┣ 📂middlewares
 ┃ ┃ ┣ 📜error.middlewares.ts
 ┃ ┃ ┣ 📜file.middlewares.ts
 ┃ ┃ ┣ 📜users.middlewares.ts
 ┃ ┃ ┗ 📜validation.middlewares.ts
 ┃ ┣ 📂models
 ┃ ┃ ┣ 📂database
 ┃ ┃ ┃ ┣ 📜Blacklist.ts
 ┃ ┃ ┃ ┣ 📜Bookmark.ts
 ┃ ┃ ┃ ┣ 📜Follower.ts
 ┃ ┃ ┃ ┣ 📜Hashtag.ts
 ┃ ┃ ┃ ┣ 📜Like.ts
 ┃ ┃ ┃ ┣ 📜Media.ts
 ┃ ┃ ┃ ┣ 📜Tweet.ts
 ┃ ┃ ┃ ┗ 📜User.ts
 ┃ ┃ ┣ 📜Error.ts
 ┃ ┃ ┗ 📜Success.ts
 ┃ ┣ 📂routes
 ┃ ┃ ┗ 📜users.routes.ts
 ┃ ┣ 📂services
 ┃ ┃ ┣ 📜bookmarks.services.ts
 ┃ ┃ ┣ 📜database.services.ts
 ┃ ┃ ┣ 📜followers.services.ts
 ┃ ┃ ┣ 📜hashtags.services.ts
 ┃ ┃ ┣ 📜likes.services.ts
 ┃ ┃ ┣ 📜medias.services.ts
 ┃ ┃ ┣ 📜tweets.services.ts
 ┃ ┃ ┗ 📜users.services.ts
 ┃ ┣ 📂utils
 ┃ ┃ ┣ 📜crypto.ts
 ┃ ┃ ┣ 📜email.ts
 ┃ ┃ ┣ 📜file.ts
 ┃ ┃ ┣ 📜helpers.ts
 ┃ ┃ ┗ 📜jwt.ts
 ┃ ┣ 📜index.ts
 ┃ ┗ 📜type.d.ts
 ┣ 📜.editorconfig
 ┣ 📜.env
 ┣ 📜.eslintignore
 ┣ 📜.eslintrc
 ┣ 📜.gitignore
 ┣ 📜.prettierignore
 ┣ 📜.prettierrc
 ┣ 📜nodemon.json
 ┣ 📜package.json
 ┣ 📜tsconfig.json
 ┗ 📜yarn.lock

/*
  - Tại root sẽ chứa các file cấu hình
  .env: chứa các biến môi trường, các key nhạy cảm
  .editorconfig, .eslintignore, .eslintrc, .prettierignore & .prettierrc: format code đúng chuẩn
  tsconfig.json: giúp biên dịch ts--> js
  package.json: quản lý các package của dự án

  - Thư mục dist: chứa mã js đã được biên dịch từ ts

  - Thư mục src chứa toàn bộ mã nguồn:
    - index.ts: entry point kết nối tất cả mã nguồn để phục vụ server
    - type.d.ts: định nghĩa type cho toàn src, tránh lỗi về ts

    src/constants:
      - Chứa các hằng
    src/middlewares
      - Chứa các file chứa các hàm xử lý middleware, như validate, check token, ... trước khi chuyển đến controller
      src/controllers: 
        - Chứa các file nhận request, gọi đến service để xử lý logic nghiệp vụ, trả về response
      src/services: 
        - Chứa các file chứa method gọi đến database để xử lý logic nghiệp vụ
      src/models: 
        - Chứa các Schema của dữ liệu
      src/routes: 
        - Chứa các file chứa các route
      src/utils: 
        - Chứa các file chứa các hàm tiện ích, như mã hóa, gửi email,
*/
```
