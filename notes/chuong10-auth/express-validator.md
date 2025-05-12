// nắm cơ bản express validator
schema validation

```ts
/*
  - Express validator một thư viện ngoài tập hợp các middleware giúp xác thực và làm sạch dữ liệu được gửi từ phía client (thấy chat bảo dùng Zod kết hợp ts đc ưa chuộng hơn:)))

  - Thư viện này k tự báo cái lỗi cho mình, mình tự linh hoạt với các lỗi cụ thể
  - Tối xem nó làm thực tiễn như nào rồi hiểu thôi chứ cứ ngồi đọc docs k thì khá khó
  - Làm sao để sử dụng thư viện này check điều kiện của register
  --> Viết được những cái cần check, đọc docs



*/

// Validation Chain:
    // - Xác thực và làm sạch các hàm và trả về chính các hàm đó: body(), params() ...
    // - Được viết dựa trên validator.js chỉ thao tác với string vì vậy cần convert sang string để thao tác
    // - Có 3 loại là
      // validators isEmail(), isEmpty()
      // sanitizers trim(), escape()
      // modifiers

    // - Thứ tự gọi chuỗi rất quan trọng
    // Truyền chuỗi full space vào
    // Validate if search_query is not empty, then trim it
    query('search_query').notEmpty().trim();
    Nó sẽ trả về một chuỗi rỗng
    // Trim search_query, then validate if it's not empty
    query('search_query').trim().notEmpty();
    // Nếu chuỗi ban đầu là full space thì nó bị cắt hết và k thể vượt qua đc notEmpty

    // - Khi gọi các phương thức để thay đổi thì chuỗi gốc cũng được thay đổi (giống kiểu tham chiếu), nghĩa là m có thể định nghĩa 1 cái thay đổi ban đầu để dùng cho nhiều cái handler
    const createEmailChain = () => body('email').isEmail();
    app.post('/login', createEmailChain(), handleLoginRoute);
    app.post('/signup', createEmailChain().custom(checkEmailNotInUse), handleSignupRoute);

    // - Sau khi tạo validation cần sử lý lỗi bằng validationResult()

    // - Customizing express-validator
      // - Có thể tạo validator theo ý muốn, thường sẽ là bất đồng bộ, những thay đổi này sẽ được ghi vào trường được validator
      import { param } from 'express-validator';
      import { ObjectId } from 'mongodb';

      app.post(
       '/user/:id',
        param('id').customSanitizer(value => ObjectId(value)),
        (req, res) => {
          // req.params.id is an ObjectId now
        },
      );

      // - Khi một trường k hợp lệ thì sẽ đc trả về undifield nên cần tự tạo thông báo lỗi
      body('email').isEmail().withMessage('Not a valid e-mail address');


      // Schema Validation
        // - Thực chất là validation chain nhưng dễ viết hơn
        // - Gồm hai phần key và vaulue
        checkSchema({username: {
          errorMessage: 'Invalid username',
          isEmail: true,
        }})


```
