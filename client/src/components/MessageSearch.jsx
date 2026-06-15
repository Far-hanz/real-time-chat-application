import { useState, useEffect } from "react";
import { useChat } from "../context/ChatContext";

const MessageSearch = ({ onClose }) => {
  const { selectedChat, searchMessages, searchResults, isSearching } = useChat();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!selectedChat) return;
    const timer = setTimeout(() => {
      searchMessages(selectedChat._id, query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, selectedChat]);

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Highlight matching keyword in result
  const highlight = (text, keyword) => {
    if (!keyword.trim()) return text;
    const regex = new RegExp(`(${keyword})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="search-highlight">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="search-panel">
      <div className="search-header">
        <h3>Search Messages</h3>
        <button onClick={onClose} className="close-btn">✕</button>
      </div>

      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Type to search messages..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="search-input"
        />
        {query && (
          <button onClick={() => setQuery("")} className="clear-search">✕</button>
        )}
      </div>

      {/* Results */}
      <div className="search-results">
        {isSearching && <p className="searching-text">Searching...</p>}

        {!isSearching && query && searchResults.length === 0 && (
          <p className="no-results">No messages found for "{query}"</p>
        )}

        {!isSearching && searchResults.map((msg) => (
          <div key={msg._id} className="search-result-item">
            <div className="result-sender">
              <img
                src={msg.sender?.avatar || "/default-avatar.png"}
                alt=""
                className="avatar-xs"
              />
              <span className="result-name">{msg.sender?.name || "User"}</span>
              <span className="result-time">{formatTime(msg.createdAt)}</span>
            </div>
            <p className="result-content">{highlight(msg.content, query)}</p>
          </div>
        ))}

        {!isSearching && searchResults.length > 0 && (
          <p className="result-count">
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
          </p>
        )}
      </div>
    </div>
  );
};

export default MessageSearch;
