import { useState } from 'react';

const REACTIONS = ['❤️', '😂', '👍', '😮', '😢', '🔥'];

export default function MessageBubble({ message, isMe }) {
  const [reaction, setReaction] = useState(null);
  const [showReactions, setShowReactions] = useState(false);

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`bubble-wrap ${isMe ? 'bubble-wrap-me' : ''}`}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      {/* Reaction picker */}
      {showReactions && (
        <div className={`reaction-picker ${isMe ? 'picker-left' : 'picker-right'}`}>
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              className="reaction-btn"
              onClick={() => setReaction(reaction === emoji ? null : emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div className={`bubble ${isMe ? 'bubble-me' : 'bubble-them'}`}>
        <p>{message.message || message.content}</p>
        <span className="bubble-time">
          {time} {isMe && (message.seen ? '✓✓' : '✓')}
        </span>
      </div>

      {reaction && (
        <span className="reaction-badge">{reaction}</span>
      )}
    </div>
  );
}