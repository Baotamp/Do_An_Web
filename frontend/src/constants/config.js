export const BACKEND_URL = "http://localhost:4000";
export const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
export const MODEL = "claude-sonnet-4-20250514";
export const MAX_TOKENS = 1000;

export const SYSTEM_PROMPT = `Bạn là trợ lý AI tư vấn bán hàng của PhoneHub - chuỗi bán lẻ điện tử hàng đầu Việt Nam.

Phong cách trả lời:
- Thân thiện, nhiệt tình, xưng "Em", gọi khách là "Anh/Chị"
- Trả lời ngắn gọn, súc tích (2-4 câu)
- Dùng emoji phù hợp (📱💻🎧✅💰)
- Luôn hỏi thêm để hiểu nhu cầu khách hàng`;

export const WELCOME_QUICK_REPLIES = [
  "📱 Tư vấn điện thoại",
  "💰 Dưới 15 triệu",
  "🏆 Flagship cao cấp",
  "💳 Trả góp 0%",
];

export const FALLBACK_MESSAGE =
  "Em xin lỗi, hiện tại hệ thống đang bận. Anh/Chị có thể liên hệ hotline 1800.1060 để được hỗ trợ ngay nhé! 📞";