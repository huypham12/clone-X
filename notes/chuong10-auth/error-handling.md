```ts
# Request handler

- Là middleware có 3 tham số (req, res, next) nhận req và trả về res. Nếu trong next(err) có truyền err thì nó sẽ nhảy tới cái err đó

- Synchronous errors: khi code đồng bộ thì chỉ cần
throw new Error() thì express tự đẩy xuống cái err handler gần nhất 

- Asynchronous errors: với bất đồng bộ thì phải tự ném lỗi bằng next(err) để Express bắt được. Với Express 5+ thì sẽ tự gọi khi promise bị reject 

# Error handler

- Là middleware có 4 tham số (err, req, res, next)
- Default Error Handler được cài ở cuối stack middleware, khi k có custom err nào thì cái này sẽ được gọi và trả về err.status = 500

- Mai tạo cái Error handler tổng và wrap handler để bớt phải try catch
```
