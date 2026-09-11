# StoryForge PRO Total v6

Bản tổng thể của StoryForge: giao diện dark studio, thư viện truyện có bìa, editor tự lưu, lịch sử phiên bản, dữ liệu nhân vật/thế giới/timeline/Canon/ghi chú, trợ lý Gemini với 4 chế độ, lịch sử hội ý cloud và quản trị thành viên.

## Cài đặt
1. Giữ `.env` cũ của project.
2. Đảm bảo Vercel có `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_ACCESS_PASSWORD` và `GEMINI_API_KEY`, `GEMINI_MODEL`.
3. Trong Supabase SQL Editor chạy theo thứ tự các schema/migration cũ đang dùng, sau đó chạy `supabase/migration-pro.sql`.
4. Push GitHub. Vercel sẽ build lại.

## AI
API nằm ở `/api/ai.js` và dùng Gemini server-side để không lộ API key trên trình duyệt. 4 chế độ: Viết tiếp, Gợi ý diễn biến, Gợi ý lời thoại, Kiểm tra logic.

## Lưu ý
Bản thảo không tự bị AI sửa. Chỉ khi tác giả bấm `Chèn vào bản thảo` thì kết quả Viết tiếp mới được đưa vào chương.
