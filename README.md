# StoryForge PRO Final

Bản hoàn chỉnh: workspace truyện, editor có lưu thủ công + autosave, phiên bản, AI inline, dữ liệu nhân vật/thế giới/timeline/Canon/ghi chú, lịch sử AI, admin duyệt thành viên.

## Supabase
1. Mở Supabase -> SQL Editor.
2. Chạy toàn bộ `supabase/storyforge-pro-final.sql` một lần.
3. Sau khi tài khoản admin đã đăng ký, chạy dòng `update public.profiles...` ở cuối SQL với email admin.

## Vercel environment
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (mặc định `gemini-3.1-flash-lite` trong api/ai.js)

## Build
`npm install`
`npm run build`

AI chỉ sửa bản thảo khi tác giả bấm chèn. Editor có nút **Lưu chương**, autosave và trạng thái lưu thật.
