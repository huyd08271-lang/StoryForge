# Deploy StoryForge PRO Total

1. Giữ nguyên `.git` và `.env` của project hiện tại.
2. Copy toàn bộ nội dung bản PRO Total vào thư mục project, không xóa `.git`.
3. Đảm bảo Vercel có các biến môi trường trong `AI-SETUP.md`.
4. Trong Supabase SQL Editor chạy `schema.sql`, `schema-v2.sql`, `schema-v3.sql`, `migration-v4.sql` nếu project chưa từng chạy chúng; sau đó chạy `migration-pro.sql`.
5. Kiểm tra tài khoản Admin có `is_admin=true` và `status='approved'`.
6. Commit và push:

```powershell
git add .
git commit -m "StoryForge PRO Total"
git push
```

Vercel sẽ tự deploy commit mới.

## Nếu Vercel báo build error
Mở Deployments → deployment lỗi → Build Logs và lấy phần lỗi đầu tiên. Không xóa project hoặc `.git` để thử lại.
