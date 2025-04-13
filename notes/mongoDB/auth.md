```ts
/* 
  Authencation: Xác thực quyền truy cập của người dùng khi người dùng đăng nhập kiểm tra xem có khớp với db không (bạn là ai?)
  Authorization: Sau khi xác thực rồi, thì người dùng này được phép làm gì? (bạn được làm gì?)

  Cookies
  - Cookies là cái file được lưu ở phía client chứa một số thông tin về người dùng
  - Có thể đọc cookie từ trình duyệt thông qua document.cookie
  - Khi cookie được đặt thêm http only thì js không thể đọc cookie đó (tránh XSS)
  - Cookie có thể được cài đặt thời hạn sống qua Expires.
  - Khi cookie được đặt thêm sercure thì chỉ có thể gửi yêu cầu lên server với https
  (tạm thời hiểu thế đã có gì thêm tiếp)

  Session
  - Do http là giao thức không trạng thái nên cần một cơ chế để lưu trữ lại trạng thái giữa mỗi lần request, đó là session
  - Session được lưu trữ tại server để nhớ trạng thái của phiên, sau đó server gửi về cho client một sessionID để giữ cái phiên đăng nhập này, khi client gửi request thì sẽ gửi kèm cái sessionID này để báo cho server biết là client đang trong phiên đăng nhập
  - Mỗi session này thường có thời hạn, khi hết thời hạn người dùng phải đăng nhập lại để tạo session mới
  - Việc này giúp bảo mật hơn, tránh bị hack, tuy nhiên thì do session được lưu ở server nên sẽ rất tốn bộ nhớ và mỗi lần xác thực yêu cầu sẽ rất chậm. Đó là lí do JWT ra đời

  JWT (json web token)
  - Là một dạng token (token là một chuỗi mã hóa đại diện cho quyền truy cập, server sẽ mở quyền truy cập cho client nếu client gửi đúng token)
  - JWT gồm 3 phần: HEADER.PAYLOAD.SIGNATURE
    - HEADER: chứa thông tin về loại token và dạng thuật toán mã hóa. Được mã hóa dưới dạng chuỗi Base64Url 
    - PAYLOAD: Chứa các thông tin của người dùng. Được mã hóa dưới dạng chuỗi Base64Url
    - SIGNATURE: là kết quả của quá trình mã hóa header, payload và serket key
    - Header và payload sẽ được ghép lại với nhau header.payload rồi mã hóa, sau đó dùng cái mã hóa này ghép với sercet key rồi lại mã hóa tiếp theo chuẩn mã hóa được lưu tại header. Kết quả của quá trình mã hóa này ta được Signature
    - Header và payload có thể bị sửa, tuy nhiên signature được tạo ra từ việc mã hóa header, payload và sercet key vậy nên khi thay đổi nội dung của header và payload thì signature không còn hợp lệ nữa

  Quá trình xác thực jwt bằng access token:
  - Khi người dùng đăng nhập thành công, server sẽ tạo hai cái token là access token và refresh token (được lưu và db) và gửi cho người dùng.
  - Sau khi người dùng nhận dược hai token này chúng sẽ được lưu trữ tại bộ nhớ thiết bị (thường là cookie), người dùng dùng cái token này để xác thực đăng nhập trong các lần tiếp theo.
  - Khi server nhận được token mà người dùng gửi lên, server sẽ xác minh xem có đúng không, nếu đúng thì tiếp tục cấp quyền.
  - Việc không lưu token ở server giống như session giúp giảm tải bộ nhớ, tiết kiệm thời gian xác thực, hơn nữa lại rất bảo mật
  - Tuy nhiên vì chứa dữ liệu nhạy cảm nên thời gian tồn tại của access token khá ngắn khoảng vài phút (để đảm bảo an toàn vì nó là stateless, chúng ta không thể xóa hay làm gì nó). Người ta lại sinh thêm cái refresh token để duy trì đăng nhập cho người dùng

  Refresh token:
  - Được cc cùng access token, khi access token hết hạn, người dùng có thể dùng refresh token để lấy một access token mới mà k cần đăng nhập lại. Token này được lưu trữ tại https only và có thời gian dài hơn khoảng vài tháng.
  - Khi server nhận được refresh token từ người dùng, nếu hợp lệ, sẽ xóa cái cũ và tạo cái mới nhưng với expire date như cũ, đồng thời cũng tạo một access token mới. 
  - Quá trình xác thực tiếp tục diễn ra như vậy.

  - Việc refresh token được lưu tại db có thể giúp giảm thiểu rủi do về bảo mật khi ta có thể quyết định được sự tồn tại của nó.

*/
```
