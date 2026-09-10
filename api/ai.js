const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

function compact(value, max = 12000) {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "", null, 2);
  return text.length > max ? text.slice(0, max) + "\n...[đã rút gọn]" : text;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: "Chưa cấu hình GEMINI_API_KEY trên Vercel." });

  try {
    const body = req.body || {};
    const { action = "chat", prompt = "", context = {}, selection = "" } = body;
    const model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

    if (!prompt.trim() && action === "chat") {
      return res.status(400).json({ error: "Thiếu nội dung yêu cầu." });
    }

    const system = `
Mày là Trợ lý AI của StoryForge, một ứng dụng viết tiểu thuyết.
Nhiệm vụ: hỗ trợ tác giả, không giành quyền tác giả.

LUẬT BẮT BUỘC:
1. Canon là luật cao nhất. Không tự ý thay đổi, phủ nhận hoặc viết trái Canon.
2. Không tự ý giết, thêm hoặc đổi vai trò nhân vật lớn nếu tác giả chưa yêu cầu.
3. Không tự ý thay đổi tính cách, quá khứ, quan hệ hoặc mốc thời gian đã có.
4. Nếu dữ liệu thiếu hoặc mâu thuẫn, phải nói rõ và đề xuất phương án; không coi phương án đề xuất là sự thật.
5. Khi viết truyện: viết tự nhiên bằng tiếng Việt, tránh văn phong tu tiên Trung Quốc, tránh sáo rỗng, không tự ý làm nhân vật quá mạnh.
6. Bám sát đoạn hiện tại và những gì tác giả đã thiết lập.
7. Với action=continue: tạo đoạn văn có thể đặt ngay sau đoạn hiện tại. Không giải thích dài dòng.
8. Với action=suggest: đưa ra vài hướng diễn biến cụ thể.
9. Với action=dialogue: tập trung vào lời thoại phù hợp tính cách và tình huống.
10. Với action=logic: chỉ ra mâu thuẫn/rủi ro logic trước, sau đó đề xuất cách sửa.
11. Với action=chat: trả lời trực tiếp câu hỏi của tác giả.

NGỮ CẢNH TRUYỆN:
${compact(context.story, 5000)}

CHƯƠNG HIỆN TẠI:
${compact(context.chapter, 18000)}

NHÂN VẬT:
${compact(context.characters, 10000)}

THẾ GIỚI:
${compact(context.world, 10000)}

DÒNG THỜI GIAN:
${compact(context.timeline, 8000)}

GHI CHÚ:
${compact(context.notes, 8000)}

CANON:
${compact(context.canon, 16000)}

ĐOẠN ĐANG ĐƯỢC TÁC GIẢ QUAN TÂM:
${compact(selection, 7000)}
`;

    const userPrompt = `YÊU CẦU CỦA TÁC GIẢ (action=${action}):\n${prompt}`;

    const response = await fetch(
      `${GEMINI_BASE_URL}/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: system }]
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }]
            }
          ],
          generationConfig: {
            thinkingConfig: {
              thinkingLevel: "low"
            }
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const message =
        data?.error?.message ||
        data?.error?.status ||
        "Gemini API trả về lỗi.";
      return res.status(response.status).json({ error: message });
    }

    const text = (data?.candidates?.[0]?.content?.parts || [])
      .map(part => part?.text || "")
      .join("")
      .trim();

    return res.status(200).json({
      text: text || "AI không trả về nội dung."
    });
  } catch (error) {
    console.error("StoryForge Gemini AI error", error);
    return res.status(500).json({
      error: error?.message || "Lỗi máy chủ AI."
    });
  }
}
