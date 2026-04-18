export default function QuickReplies({ replies, onSelect }) {
  if (!replies || replies.length === 0) return null;

  return (
    <div className="tgdd-qr">
      {replies.map((reply) => (
        <button
          key={reply}
          className="tgdd-qr__btn"
          onClick={() => onSelect(reply)}
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
