```bash
# Git Notes – Cơ bản

# Repository (repo)
- Là nơi lưu trữ mã nguồn của dự án, có thể là **local** hoặc **remote (GitHub, GitLab,...)**.

# Khởi tạo Git repository (local)
git init

# Cấu hình Git

# Cấu hình global (áp dụng cho toàn bộ máy)
git config --global user.name "Du Thanh Duoc"
git config --global user.email "duthanhduoc@gmail.com"

# Xem cấu hình global
git config --global --list

# Cấu hình local (chỉ áp dụng cho repo hiện tại — yêu cầu đã git init)
git config --local --list

# Thêm file vào Staging area

# Thêm toàn bộ file
git add .

# Thêm file cụ thể
git add <file_name>

# Khôi phục file từ Staging về Working Directory

# Khôi phục toàn bộ
git reset .

# Khôi phục file cụ thể
git reset <file_name>

# Commit thay đổi vào local repo

# Commit với message
git commit -m "Mô tả ngắn gọn về thay đổi"

```
