```ts
// DBMS: hệ quản trị csdl
/*
  MONGO DB
  - Dữ liệu lưu dưới dạng BJSON
  - Ko cần Schema cố định như SQL
  - Hiệu năng, dễ mở rộng chiều ngang


  MONGO ATLAS (lưu db online)
  Organizations --> Project --> Cluster--> Database --> Collection --> Documment

  - Cluster: máy chủ ảo để chứa database (giống server)
  - Collection: tương đương với "Table" trong SQL
  - Document: tương đương với "Row" trong SQL, nhưng dạng JSON


*/

// Làm việc với mongosh (shell)
//   Một số lệnh cơ bản
// DB
show dbs             // Liệt kê tất cả database
use <dbName>        // Chuyển sang database (tạo nếu chưa có)
db                 // Xem database hiện tại
db.dropDatabase() // Xoá database hiện tại

// Collection
show collections              // Liệt kê các collection
db.createCollection("tên")   // Tạo collection
db.getCollectionNames()     // Trả về mảng tên collection
db.<collection>.drop()     // Xoá collection

//CRUD
// CREATE
db.users.insertOne({ name: "Huy", age: 20 })
db.users.insertMany([{...}, {...}])

// READ
db.users.find()
db.users.find().pretty()
db.users.find({ age: { $gt: 18 } }) // $gt là toán tử truy vấn, tự đọc thêm
db.users.findOne({ name: "Huy" })

// UPDATE
db.users.updateOne({ name: "Huy" }, { $set: { age: 21 } })
db.users.updateMany(...)

// DELETE
db.users.deleteOne({ name: "Huy" })
db.users.deleteMany(...)


```
