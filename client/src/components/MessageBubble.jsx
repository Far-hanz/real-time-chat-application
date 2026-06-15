const MessageBubble = ({ message, currentUser, participants, isLastMessage }) => {
  const isMine = message.sender?._id === currentUser._id ||
                 message.sender === currentUser._id;

  const otherParticipants = participants?.filter(
    (p) => (p._id || p) !== currentUser._id
  ) || [];

  const readByOthers = message.readBy?.filter((r) => {
    const readerId = r.user?._id || r.user;
    return readerId !== currentUser._id;
  }) || [];

  const allOthersSeen =
    otherParticipants.length > 0 &&
    readByOthers.length >= otherParticipants.length;

  const someSeen = readByOthers.length > 0 && !allOthersSeen;

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={`message-row ${isMine ? "mine" : "theirs"}`}>
      {!isMine && (
        <img
          src={message.sender?.avatar || "/default-avatar.png"}
          alt={message.sender?.name || "User"}
          className="avatar-sm message-avatar"
          title={message.sender?.name}
        />
      )}

      <div className={`bubble-wrapper ${isMine ? "mine" : "theirs"}`}>
        {!isMine && message.sender?.name && (
          <span className="sender-name">{message.sender.name}</span>
        )}

        <div className={`bubble ${isMine ? "bubble-mine" : "bubble-theirs"}`}>
          {message.isDeleted ? (
            <span className="deleted-msg">🚫 This message was deleted</span>
          ) : (
            <p>{message.content}</p>
          )}
        </div>

        <div className="message-meta">
          <span className="timestamp">{formatTime(message.createdAt)}</span>

          {isMine && isLastMessage && (
            <span className={`read-receipt ${allOthersSeen ? "seen" : "sent"}`}>
              {allOthersSeen ? (
                <span title="Seen by all">✓✓</span>
              ) : someSeen ? (
                <span title="Seen by some" className="partial-seen">✓✓</span>
              ) : (
                <span title="Sent">✓</span>
              )}
            </span>
          )}

          {isMine && readByOthers.length > 0 && (
            <span className="seen-by-list" title={`Seen by: ${readByOthers.map(r => r.user?.name || "User").join(", ")}`}>
              👁 {readByOthers.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
