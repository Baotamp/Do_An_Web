import { useState, useCallback } from "react";
import { WELCOME_QUICK_REPLIES, FALLBACK_MESSAGE } from "../constants/config";

const BACKEND_URL = "http://localhost:4000";

function getNow() {
  return new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function extractQuickReplies(reply, userMsg) {
  const lower = reply.toLowerCase();
  const lowerUser = userMsg.toLowerCase();

  if (
    lowerUser.includes("điện thoại") ||
    lower.includes("iphone") ||
    lower.includes("samsung")
  ) {
    return ["📱 iPhone 15 Pro Max", "📱 Samsung S24 Ultra", "💰 Dưới 15 triệu"];
  }
  if (lower.includes("xiaomi") || lower.includes("oppo")) {
    return ["📱 Xiaomi 14 Ultra", "📱 OPPO Find X6 Pro", "💰 So sánh giá"];
  }
  if (lower.includes("pin") || lower.includes("camera") || lower.includes("chip")) {
    return ["📊 So sánh chi tiết", "🛒 Mua ngay", "💰 Trả góp 0%"];
  }
  if (lower.includes("trả góp") || lower.includes("0%")) {
    return ["Điều kiện trả góp?", "Cần giấy tờ gì?", "✅ Tôi muốn đăng ký"];
  }
  return [];
}

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const [initialized, setInitialized] = useState(false);

  const addBotMessage = useCallback((text, replies = []) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "bot", text, time: getNow() },
    ]);
    setQuickReplies(replies);
  }, []);

  const initialize = useCallback(() => {
    if (initialized) return;
    setInitialized(true);
    setTimeout(() => {
      addBotMessage(
        "Xin chào Anh/Chị! 👋 Em là trợ lý AI của PhoneHub.\n\nEm rất sẵn lòng hỗ trợ Anh/Chị tư vấn về điện thoại, laptop, phụ kiện và các chính sách trả góp 0%.\n\nHôm nay Anh/Chị cần tư vấn sản phẩm gì ạ? 😊",
        WELCOME_QUICK_REPLIES
      );
    }, 400);
  }, [initialized, addBotMessage]);

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || isTyping) return;

      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "user", text, time: getNow() },
      ]);
      setQuickReplies([]);

      const newHistory = [...history, { role: "user", content: text }];
      setHistory(newHistory);
      setIsTyping(true);

      try {
        const response = await fetch(`${BACKEND_URL}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
            history: newHistory,
          }),
        });

        const data = await response.json();
        const reply = data.reply || FALLBACK_MESSAGE;

        setHistory((prev) => [...prev, { role: "assistant", content: reply }]);
        addBotMessage(reply, extractQuickReplies(reply, text));
      } catch (error) {
        console.error("Chat send error:", error);
        addBotMessage(FALLBACK_MESSAGE, ["🔄 Thử lại", "📞 Hotline 1800.1060"]);
      } finally {
        setIsTyping(false);
      }
    },
    [history, isTyping, addBotMessage]
  );

  return {
    messages,
    isTyping,
    quickReplies,
    sendMessage,
    initialize,
    setQuickReplies,
  };
}