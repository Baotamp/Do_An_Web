import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import QuickReplies from "./QuickReplies";
import ChatInput from "./ChatInput";
import { ShieldIcon } from "./Icons";

export default function ChatWindow({ isOpen, onClose, messages, isTyping, quickReplies, onSend, onQuickReply }) {
  return (
    <div className={`tgdd-window${isOpen ? " tgdd-window--open" : ""}`} role="dialog" aria-label="Chat tư vấn AI">
      <ChatHeader onClose={onClose} />

      <div className="tgdd-banner">
        <ShieldIcon />
        Thông tin chỉ mang tính tham khảo, được tư vấn bởi Trí Tuệ Nhân Tạo
      </div>

      <ChatMessages messages={messages} isTyping={isTyping} />

      <QuickReplies replies={quickReplies} onSelect={onQuickReply} />

      <ChatInput onSend={onSend} disabled={isTyping} />

      <div className="tgdd-footer-note">PhoneHub • Trợ lý AI 24/7</div>
    </div>
  );
}
