import { BotIcon, CloseIcon } from "./Icons";

export default function ChatHeader({ onClose }) {
  return (
    <div className="tgdd-header">
      <div className="tgdd-header__avatar">
        <BotIcon size={22} color="#f5a623" />
      </div>
      <div className="tgdd-header__info">
        <div className="tgdd-header__name">PhoneHub AI</div>
        <div className="tgdd-header__status">
          <span className="tgdd-header__dot" />
          <span>Đang hoạt động • Phản hồi ngay</span>
        </div>
      </div>
      <button className="tgdd-header__close" onClick={onClose} aria-label="Đóng chat">
        <CloseIcon />
      </button>
    </div>
  );
}
