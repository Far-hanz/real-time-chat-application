import { useEffect, useRef, useState, useCallback } from "react";
import { useChat } from "../context/ChatContext";
import MessageBubble from "./MessageBubble";

const MessageList = ({ currentUser, socket }) => {
  const { selectedChat, messages, fetchMessages, markAsRead } = useChat();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const bottomRef = useRef(null);
  const topRef = useRef(null);

  useEffect(() => {
    if (!selectedChat) return;
    setPage(1);
    setHasMore(true);

    fetchMessages(selectedChat._id, 1).then((data) => {
      if (data) {
        setHasMore(data.currentPage < data.totalPages);
      }
    });

    markAsRead(selectedChat._id);

    if (socket) {
      socket.emit("mark_read", { chatId: selectedChat._id });
    }
  }, [selectedChat?._id]);

  useEffect(() => {
    if (page === 1) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const data = await fetchMessages(selectedChat._id, nextPage);
    if (data) {
      setPage(nextPage);
      setHasMore(nextPage < data.totalPages);
    }
    setLoadingMore(false);
  }, [hasMore, loadingMore, page, selectedChat]);

  if (!selectedChat) {
    return (
      <div className="empty-state">
        <p>Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="message-list-container">
      <div ref={topRef} className="load-more-wrapper">
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="load-more-btn"
          >
            {loadingMore ? "Loading..." : "↑ Load older messages"}
          </button>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="empty-messages">
          <p>No messages yet. Say hello! 👋</p>
        </div>
      ) : (
        messages.map((msg, index) => (
          <MessageBubble
            key={msg._id || index}
            message={msg}
            currentUser={currentUser}
            participants={selectedChat.participants}
            isLastMessage={index === messages.length - 1}
          />
        ))
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
