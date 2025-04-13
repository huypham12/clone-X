```ts
/*
  Thiết kế schema với mongodb
  - Thiết kế Schema như nào còn phụ thuộc vào tính chất của dự án
  
  - Có hai dạng lưu trữ dữ liệu trong mongo db là nhúng và tham chiếu

  Embedding: 
  - Lưu trữ dữ liệu liên quan trực tiếp trên một tài liệu. 
  - Dùng khi các dữ liệu liên quan thường được truy xuất cùng nhau.
  - Với các quan hệ 1-1 hoặc 1-ít :)))
  - Mục đích cần truy vấn nhanh thông tin

  Referencing:
  - Lưu trữ dữ liệu liên quan trên các docs khác nhau, và liên kết qua id (giống liên kết giữa các bảng)
  - Dùng khi dữ liệu không được truy xuất cùng nhau ví dụ như user và order nên tách ra.
  - Dùng khi quan hệ là 1-n hoắc dữ liệu có kích thước lớn
  - Mục đích để tái sử dụng, mở rộng

  Theo t thì cái nhúng là cái hay của mongo giúp giải quyết cái vấn đề phải chia quá nhiều bảng cho đúng chuẩn của SQL
  Nhưng mà nó lại khốn nạn ở chỗ là ko có thiết kế rõ ràng:))
*/

```
