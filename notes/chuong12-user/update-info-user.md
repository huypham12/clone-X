# /me
1. Người dùng gửi lên 
  Method: PATCH
  Header: {Authorization: Bearer <access_token>}
  Body: {userInfo: object}
2. Validation access-token
3. Check xem người dùng đã xác thực chưa
4. Validate req.body