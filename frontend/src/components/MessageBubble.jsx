import { BotIcon } from "./Icons";

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>")
    .replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
}

export default function MessageBubble({ message }) {
  const isBot = message.role === "bot";

  return (
    <div className={`tgdd-row${isBot ? "" : " tgdd-row--user"}`}>
      {isBot && (
        <div className="tgdd-row__avatar">
          <BotIcon size={16} color="#fff" />
        </div>
      )}
      <div>
        <div
          className={`tgdd-bubble ${isBot ? "tgdd-bubble--bot" : "tgdd-bubble--user"}`}
          {...(isBot
            ? { dangerouslySetInnerHTML: { __html: formatText(message.text) } }
            : { children: message.text }
          )}
        />
        <div className="tgdd-time">{message.time}</div>
      </div>
    </div>
  );
}
