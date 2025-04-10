// viết code kiểu tổng quát có thể hoạt động ở nhiều kiểu dữ liệu khác nhau nhưng vẫn đảm bảo tính an toàn, nghĩa là đang ở kiểu này thì chỉ là kiểu này, không có lẫn lộn

// T là type parameter đại diện cho kiểu dữ liệu mà bạn truyền vào. Khi gọi hàm, bạn có thể truyền kiểu cụ thể hoặc để TypeScript tự suy diễn.
function identity<T>(arg: T): T {
  return arg
}

// Sử dụng generics, TypeScript tự suy diễn kiểu
const output1 = identity<string>('Hello Generics')
const output2 = identity(123)

console.log(output1) // "Hello Generics"
console.log(output2) // 123
