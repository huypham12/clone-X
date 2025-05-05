
```ts

//bạn hãy chỉnh lại cái note trên cho nó chuyên nghiệp và clean, nếu có chỗ sai hoặc thiết bạn hãy sửa lại hoặc bổ sung để tài liệu sau này theo dõi lại được dễ dàng

// BASIC TYPES
// Khai báo các kiểu dữ liệu cơ bản
const car: string = 'bmw'
const num: number = 100
const isLoading: boolean = true

// Các giá trị đặc biệt
const body = undefined
const user = null

// Kiểu any cho phép gán nhiều kiểu giá trị
let person: any
person = 1
person = 'kkk'
person = false

console.log(car, num, isLoading, body, user, person)
// Output: bmw 100 true undefined null false

// OBJECT
// Khai báo một object với kiểu định nghĩa rõ ràng
const house: { address: string } = {
  address: ''
}

// Gán lại giá trị cho thuộc tính
house.address = 'Ninh Binh'
console.log(house)
// Output: { address: 'Ninh Binh' }

// ARRAY
// Khai báo một mảng chứa các phần tử kiểu string
const products: string[] = []
products.push('vest')
products.push('suit')
console.log(products)
// Output: [ 'vest', 'suit' ]

// OBJECT ARRAY
// Khai báo mảng đối tượng với cấu trúc cụ thể
const people: { name: string; age: number }[] = []

// Lưu ý: Giá trị của 'age' phải là number, không phải string
people.push({ name: 'Huy', age: 20 })
people.push({ name: 'Long', age: 20 })

console.log(people)
// Output: [ { name: 'Huy', age: 20 }, { name: 'Long', age: 20 } ]

// FUNCITION
// Định nghĩa một hàm tính tổng với kiểu number cho tham số và kiểu trả về là number
const sum = (num1: number, num2: number): number => {
  return num1 + num2
}

console.log(sum(1, 2))
// Output: 3

// UNION TYPES
// Union cho phép biến nhận giá trị của nhiều kiểu khác nhau
let price: string | number | boolean
price = '123'
price = 456
price = true

// ENUM 
// Enum: khi build ra JS, enum sẽ trở thành object
enum Sizes {
  S,
  M,
  L,
  X,
  XL
}

console.log(Sizes.S) // Output: 0

// INTERFACE 
// Interface dùng để định nghĩa cấu trúc của một object. Ưu điểm của interface là có thể kế thừa và gộp nhiều định nghĩa (declaration merging).
// Định nghĩa interface ban đầu
interface User1 {
  name: string
  age: number
}

// Gộp thêm thuộc tính cho cùng interface
interface User1 {
  address: string
}

// Khi gộp, object cần có đầy đủ các thuộc tính từ cả hai interface
const u: User1 = {
  name: 'Huy',
  age: 20,
  address: 'Ninh Binh'
}

// TYPE ALIASES
// Type cung cấp khả năng định nghĩa kiểu dữ liệu cho object, union, tuple, intersection,... linh hoạt hơn interface nhưng không hỗ trợ declaration merging.

// Union type
type Status = 'active' | 'inactive'

// Tuple type
type Point = [number, number]

// Intersection type: kết hợp hai kiểu đối tượng thành một
type User = { name: string } & { age: number }

// CLASS
// Class trong TypeScript hoạt động như trong JavaScript, có thêm hệ thống kiểu và tính năng của OOP.
// Sử dụng access modifiers như private, public, và readonly giúp kiểm soát truy cập và tính bất biến của thuộc tính.

class Car {
  private id: string
  readonly name: string
  color: string

  constructor(id: string, name: string, color: string) {
    this.id = id
    this.name = name
    this.color = color
  }

  showInfo(): void {
    console.log(`${this.name} - ${this.color}`)
  }
}

const bmw = new Car('1', 'bmw i8', 'black')
bmw.showInfo()
// Output: bmw i8 - black

console.log(bmw)
// Output: Car { id: '1', name: 'bmw i8', color: 'black' }

```
