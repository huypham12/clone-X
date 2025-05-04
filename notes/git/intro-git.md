```bash
# Git Notes – Cơ bản đến thực chiến

# Repository (repo)
- Là nơi lưu trữ mã nguồn, có thể local (trên máy) hoặc remote (GitHub,...)

# Khởi tạo repository
git init

# Cấu hình Git

# Cấu hình toàn cục (toàn bộ máy)
git config --global user.name "Huy Pham"
git config --global user.email "huy9008437@gmail.com"

# Xem cấu hình
git config --global --list
git config --local --list

# Trạng thái của file
git status

# Thêm file vào Staging area

git add .                 # Thêm tất cả file
git add <file_name>       # Thêm file cụ thể

# Khôi phục khỏi Staging (quay về Working Directory)

git reset .               # Bỏ toàn bộ file khỏi staging
git reset <file_name>     # Bỏ 1 file khỏi staging

# Commit thay đổi vào local repo

git commit -m "Nội dung thay đổi"

# Xem lịch sử commit

git log                   # Danh sách commit
git log --oneline         # Rút gọn 1 dòng mỗi commit
git log --graph --oneline # Hiển thị sơ đồ nhánh đơn giản

# So sánh thay đổi

git diff                  # So sánh code đã thay đổi (chưa add)
git diff --staged         # So sánh giữa staging và commit gần nhất

# Xóa file theo dõi bởi Git

git rm <file_name>        # Xóa file và đưa vào commit

# Làm việc với Remote Repository

git remote add origin <url>  # Liên kết với remote repo
git push -u origin main      # Đẩy code lên nhánh chính (lần đầu)
git push                     # Đẩy các thay đổi tiếp theo
git pull                     # Kéo code mới về từ remote

# Làm việc với Branch

git branch                   # Xem danh sách branch
git branch <branch_name>     # Tạo branch mới
git checkout <branch_name>   # Chuyển branch
git checkout -b <branch>     # Tạo mới + chuyển nhanh
git merge <branch>           # Gộp branch vào hiện tại
git branch -d <branch_name>  # Xóa branch

# Bỏ qua file không muốn theo dõi
# Tạo file .gitignore và thêm tên các file/thư mục cần bỏ qua


```
