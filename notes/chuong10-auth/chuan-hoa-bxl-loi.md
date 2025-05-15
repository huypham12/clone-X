# Các loại lỗi

400: bad request (sai cú pháp hoặc thiếu dữ liệu)
404: Not Found (k tìm thấy tài nguyên)
401: Unauthorized (chưa xác thực)
403: Forbidden (bị cấm truy cập)
409: Conflict (trùng lặp dữ liệu)
422: Unprocessable Entity (dữ liệu gửi lên k sai logic/format)
500: Internal Server Error (lỗi phía server)

# Format lỗi trả về cho người dùng

```ts
{
  message: string,
  error_info?: any
}
```
# Trả về các lỗi với các message và status tương ứng
