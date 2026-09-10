# StoryForge AI v1

Bản này nối nút **Gợi ý cho đoạn này** và **Trợ lý AI** vào OpenAI thông qua Vercel Function `/api/ai`.

## 1. Vercel Environment Variables

Vào **Project → Settings → Environment Variables** và thêm:

- `OPENAI_API_KEY` = API key OpenAI của mày
- `OPENAI_MODEL` = `gpt-5-mini` (hoặc model mà tài khoản/API của mày hỗ trợ)

Chọn **Production**. Có thể chọn Preview nếu muốn test preview.

Không đặt `OPENAI_API_KEY` thành biến `VITE_...` và không đưa key vào `main.jsx`.

## 2. Deploy

Commit/push source lên GitHub. Vercel sẽ build lại. Nếu chỉ thêm environment variable, cần redeploy để deployment nhận biến mới.

## 3. Cách dùng

Trong một chương:

1. Viết đoạn văn.
2. Bấm **Gợi ý cho đoạn này**.
3. Chọn `Viết tiếp`, `Gợi ý diễn biến`, `Gợi ý lời thoại` hoặc `Kiểm tra logic`.
4. AI đọc context của truyện từ Supabase: Canon, nhân vật, thế giới, timeline, ghi chú và chương hiện tại.
5. Bấm **Chèn vào bản thảo** nếu muốn đưa kết quả vào chương.

Trong menu **Trợ lý AI**, mày có thể hỏi trực tiếp về truyện.

## 4. Bảo mật

API key chỉ nằm ở Vercel server function. Không commit `.env` hoặc API key vào GitHub.
