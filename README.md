# StoryForge Online — Full Functions

Bản này dùng **giao diện Online làm nền** và lưu dữ liệu thật trên Supabase.

## Chức năng cloud

- Đăng ký / đăng nhập / đăng xuất
- Admin duyệt tài khoản
- Tạo / mở / xóa truyện
- Tạo / sửa tên / xóa chương
- Editor chương
- Autosave + nút Lưu ngay
- Word count
- Nhân vật
- Thế giới
- Dòng thời gian
- Hộp thư đến
- Canon
- Responsive cho điện thoại
- Dữ liệu truyện/chương không phụ thuộc máy đang dùng

## Mô hình

PC/điện thoại → Vercel → Supabase Cloud

`localhost` chỉ dùng để test code. Bản người dùng cuối là URL Vercel.

## Chạy local

Đứng trong thư mục có `package.json`:

```powershell
npm.cmd install
npm.cmd run dev
```

Tạo `.env` từ `.env.example` và điền:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_SITE_ACCESS_PASSWORD=...
```

## Supabase

Nếu database đã chạy `schema-v2.sql`, có thể chạy thêm `schema-v3.sql` để thêm index, quyền stories/chapters và tự cập nhật `updated_at`.

Không dùng `service_role` key ở frontend.

## Deploy Vercel

Push source lên GitHub, rồi Vercel build bằng:

```text
npm run build
```

Thêm 3 Environment Variables tương ứng với `.env`.

## V4
- Editable story information.
- Workspace position persistence.
- AI suggestion/history persistence utilities.
