import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token"); // From Saud's auth
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch all user chats
  const fetchChats = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/chats", { headers });
      setChats(data);
    } catch (err) {
      console.error("fetchChats error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch message history for a chat
  const fetchMessages = useCallback(async (chatId, page = 1) => {
    try {
      const { data } = await axios.get(
        `/api/chats/${chatId}/messages?page=${page}&limit=30`,
        { headers }
      );
      setMessages((prev) =>
        page === 1 ? data.messages : [...data.messages, ...prev]
      );
      return data;
    } catch (err) {
      console.error("fetchMessages error:", err);
    }
  }, []);

  // Search messages in a chat
  const searchMessages = useCallback(async (chatId, query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const { data } = await axios.get(
        `/api/chats/${chatId}/messages/search?q=${encodeURIComponent(query)}`,
        { headers }
      );
      setSearchResults(data.results);
    } catch (err) {
      console.error("searchMessages error:", err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Mark messages as read (REST call; socket also handles this)
  const markAsRead = useCallback(async (chatId) => {
    try {
      await axios.patch(`/api/chats/${chatId}/messages/read`, {}, { headers });
    } catch (err) {
      console.error("markAsRead error:", err);
    }
  }, []);

  // Add incoming socket message to state
  const addIncomingMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  // Update read receipts in state when someone reads
  const updateReadReceipts = useCallback(({ chatId, readBy, readAt }) => {
    if (selectedChat?._id !== chatId) return;
    setMessages((prev) =>
      prev.map((msg) => {
        const alreadyRead = msg.readBy?.some(
          (r) => r.user === readBy || r.user?._id === readBy
        );
        if (!alreadyRead) {
          return {
            ...msg,
            readBy: [...(msg.readBy || []), { user: readBy, readAt }],
          };
        }
        return msg;
      })
    );
  }, [selectedChat]);

  return (
    <ChatContext.Provider
      value={{
        chats, setChats,
        selectedChat, setSelectedChat,
        messages, setMessages,
        searchResults, setSearchResults,
        isSearching,
        loading,
        fetchChats,
        fetchMessages,
        searchMessages,
        markAsRead,
        addIncomingMessage,
        updateReadReceipts,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
