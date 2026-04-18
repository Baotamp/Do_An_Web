import { useState, useRef } from "react";
import { SendIcon } from "./Icons";

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  function handleSend() {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleChange(e) {
    setValue(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 88) + "px";
    }
  }

  return (
    <div className="tgdd-input-area">
      <textarea
        ref={textareaRef}
        className="tgdd-input"
        placeholder="Nhập tin nhắn..."
        rows={1}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button
        className="tgdd-send"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        aria-label="Gửi tin nhắn"
      >
        <SendIcon />
      </button>
    </div>
  );
}
