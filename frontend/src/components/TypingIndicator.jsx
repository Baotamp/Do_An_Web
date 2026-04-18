import { BotIcon } from "./Icons";

export default function TypingIndicator({ visible }) {
  if (!visible) return null;

  return (
    <div className="tgdd-typing">
      <div className="tgdd-row__avatar">
        <BotIcon size={16} color="#fff" />
      </div>
      <div className="tgdd-typing__dots">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
