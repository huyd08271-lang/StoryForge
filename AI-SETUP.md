# StoryForge AI — Gemini

Bản này chuyển AI backend từ OpenAI sang Google Gemini.

## Vercel Environment Variables

Thêm:

- `GEMINI_API_KEY` = API key tạo từ Google AI Studio
- `GEMINI_MODEL` = `gemini-3.1-flash-lite`

Chọn Production (và Preview nếu muốn test preview).

Không đặt Gemini API key trong biến có tiền tố `VITE_`.

Sau khi thay code và push GitHub, Vercel sẽ deploy lại. Nếu chỉ thay Environment Variables, hãy Redeploy.

## Lưu ý

Gói Gemini Pro dùng trên ứng dụng Gemini và Gemini API là hai hệ thống tính phí/quyền truy cập riêng. Bản này mặc định dùng `gemini-3.1-flash-lite` để phù hợp với Gemini API Free Tier; không dùng API của `gemini-3.1-pro-preview` trong cấu hình miễn phí.

Không commit API key vào GitHub.
