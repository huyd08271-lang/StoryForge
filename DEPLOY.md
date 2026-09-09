# Deploy nhanh

1. Tạo Supabase project và chạy `supabase/schema.sql`.
2. Tạo file `.env` cho local.
3. Test `npm install` + `npm run dev`.
4. Đưa source lên GitHub (KHÔNG commit `.env`).
5. Import repo vào Vercel.
6. Thêm VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SITE_ACCESS_PASSWORD trong Environment Variables.
7. Deploy.
8. Điện thoại 4G mở URL Vercel. Dữ liệu lấy từ Supabase, không phụ thuộc PC.
