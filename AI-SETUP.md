# StoryForge PRO Total — AI setup

## Vercel Environment Variables
- `GEMINI_API_KEY`: Gemini API key của bạn. Chỉ đặt ở Vercel, không đưa vào mã frontend.
- `GEMINI_MODEL`: model Gemini bạn muốn dùng. Nếu tài khoản của bạn hỗ trợ Gemini 3.1 Flash Lite, dùng `gemini-3.1-flash-lite`.
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SITE_ACCESS_PASSWORD`

## Supabase migration
Sau các schema/migration cũ đang có, chạy `supabase/migration-pro.sql` một lần. Migration bổ sung ảnh bìa + trạng thái truyện, lịch sử phiên bản chương và RPC quản trị thành viên.

## 4 công cụ AI
1. **Viết tiếp** — chọn 300–500, 800–1.000, 1.500–2.000, 2.000–3.000 hoặc yêu cầu riêng.
2. **Gợi ý diễn biến** — đưa ra các hướng phát triển để tác giả lựa chọn.
3. **Gợi ý lời thoại** — bám tính cách và quan hệ nhân vật.
4. **Kiểm tra logic** — đối chiếu Canon, nhân vật, thế giới, timeline và chương hiện tại.

AI chỉ đề xuất. Bản thảo và Canon không tự bị thay đổi; chỉ `Viết tiếp` mới có nút `Chèn vào bản thảo`.

## Lịch sử hội ý
Kết quả AI được lưu vào `ai_conversations` theo user/truyện/chương để có thể mở lại.
