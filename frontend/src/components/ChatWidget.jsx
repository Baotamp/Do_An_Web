import { useState, useEffect } from "react";
import ChatWindow from "./ChatWindow";
import { ChatBubbleIcon } from "./Icons";
import { useChat } from "../hooks/useChat";
import "../styles/ChatWidget.css";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const { messages, isTyping, quickReplies, sendMessage, initialize, setQuickReplies } = useChat();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setShowBadge(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  function handleToggle() {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening) {
      setShowBadge(false);
      initialize();
    }
  }

  function handleQuickReply(text) {
    setQuickReplies([]);
    sendMessage(text);
  }

  return (
    <>
      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        isTyping={isTyping}
        quickReplies={quickReplies}
        onSend={sendMessage}
        onQuickReply={handleQuickReply}
      />

      <button className="tgdd-fab" onClick={handleToggle} aria-label="Mở chat tư vấn AI">
        <ChatBubbleIcon />
        <span className="tgdd-fab__label">Trợ lý AI</span>
        {showBadge && <div className="tgdd-fab__badge">1</div>}
      </button>
    </>
  );
}
