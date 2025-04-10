```ts
// GENERICS 
// Generics trong TypeScript - Cơ bản
//Generics cho phép viết code tổng quát có thể hoạt động với nhiều kiểu dữ liệu khác nhau mà vẫn đảm bảo tính an toàn về kiểu.
// Tính chất:
// Không lẫn lộn kiểu dữ liệu: Khi đã xác định kiểu là string, thì tất cả logic sau đó buộc phải tuân theo kiểu đó.

// T là type parameter – đại diện cho một kiểu dữ liệu cụ thể, được xác định khi sử dụng (hoặc để TypeScript tự suy diễn).

function identity<T>(arg: T): T {
  return arg
}
const output1 = identity<string>('Hello Generics') // chỉ định kiểu rõ ràng
const output2 = identity(123) // TypeScript tự suy diễn kiểu là number
console.log(output1) // "Hello Generics"
console.log(output2) // 123


```
