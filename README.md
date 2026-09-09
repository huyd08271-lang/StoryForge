# StoryForge Online 1.0

Đây là bản cloud-first: dữ liệu truyện nằm trong Supabase PostgreSQL, nên máy tính tắt vẫn không làm mất chương. PC và điện thoại đăng nhập cùng tài khoản sẽ đọc cùng dữ liệu.

## 1. Cài local để thử
- Cài Node.js LTS.
- Mở thư mục này bằng VS Code.
- Tạo `.env` từ `.env.example`.
- Điền VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY và mật khẩu truy cập.
- Chạy `npm install` rồi `npm run dev`.

## 2. Tạo database online
- Tạo project trên Supabase.
- Mở SQL Editor và chạy toàn bộ `supabase/schema.sql`.
- Đăng ký tài khoản đầu tiên trên StoryForge.
- Trong SQL Editor, chạy dòng cuối README/schema để đặt email của mày thành Admin.
- Đăng nhập lại.

## 3. Đưa website lên Internet
Có thể deploy thư mục này lên Vercel/Netlify. Khi deploy, đặt 3 biến môi trường giống `.env`.

## 4. Quan trọng
- `.env` không đưa lên GitHub.
- Mật khẩu truy cập ở bản này là một lớp cửa bổ sung; tài khoản thật vẫn phải đăng nhập và được Admin duyệt.
- Module AI hiện có giao diện và điểm nối; API key AI nên đặt ở server/serverless function, không đặt trong React.
