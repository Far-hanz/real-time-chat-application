export default function TypingIndicator({ name }) {
  return (
    <div className="bubble-wrap">
      <div className="typing-bubble">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      {name && (
        <p className="typing-label">{name} is typing...</p>
      )}
    </div>
  );
}